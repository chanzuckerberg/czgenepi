import csv
import datetime
import io
from typing import List

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.utils import (
    GenBankSubmissionFormTSVStreamer,
    GisaidSubmissionFormCSVStreamer,
)
from aspen.database.models import Sample
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.test_infra.models.pathogen_repo_config import (
    setup_gisaid_and_genbank_repo_configs,
    setup_random_repo_configs,
)
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory
from aspen.util.split import SplitClient

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_submission_template_download_gisaid(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, _ = setup_gisaid_and_genbank_repo_configs(
        async_session, split_client=split_client, default_repo="GISAID"
    )
    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                pathogen=pathogen,
                private=True,
                private_identifier=f"private{i}",
                public_identifier=f"public{i}",
            )
        )
        async_session.add(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/submission_template",
        headers=auth_headers,
        json=request_data,
    )
    expected_filename = f"{today.strftime('%Y%m%d')}_GISAID_metadata.csv"
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/csv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )

    file_contents = io.StringIO(str(res.content, encoding="UTF-8"))
    tsvreader = csv.DictReader(file_contents, delimiter=",")
    assert set(list(tsvreader.fieldnames)) == set(  # type: ignore
        GisaidSubmissionFormCSVStreamer.fields
    )
    tsvreader.__next__()  # skip human-readable headers
    row_count = 0
    for row in tsvreader:
        assert row["fn"] == f"{today.strftime('%Y%m%d')}_GISAID_sequences.fasta"
        assert (
            row["covv_virus_name"] == f"hCoV-19/{samples[row_count].public_identifier}"
        )
        assert row["covv_collection_date"] == samples[
            row_count
        ].collection_date.strftime("%Y-%m-%d")
        assert row["covv_subm_lab"] == group.name
        assert row["covv_subm_lab_addr"] == group.address
        row_count += 1
    assert row_count == len(samples)


async def test_submission_template_download_genbank_SC2(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen = random_pathogen_factory(slug="SC2")
    setup_gisaid_and_genbank_repo_configs(
        async_session, pathogen, split_client=split_client, default_repo="GenBank"
    )

    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                pathogen=pathogen,
                private_identifier=f"private{i}",
                public_identifier=f"public{i}",
            )
        )
        async_session.add(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GenBank",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/submission_template",
        headers=auth_headers,
        json=request_data,
    )
    expected_filename = f"{today.strftime('%Y%m%d')}_GenBank_metadata.tsv"
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/tsv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )

    file_contents = io.StringIO(str(res.content, encoding="UTF-8"))
    tsvreader = csv.DictReader(file_contents, delimiter="\t")
    assert set(tsvreader.fieldnames) == set(GenBankSubmissionFormTSVStreamer.fields)  # type: ignore
    row_count = 0
    for row in tsvreader:
        assert (
            row["Sequence_ID"]
            == f"SARS-CoV-2/human/{samples[row_count].public_identifier}"
        )
        assert row["collection-date"] == samples[row_count].collection_date.strftime(
            "%Y-%m-%d"
        )
        assert row["country"] == "USA: California, Santa Barbara County"
        assert row["isolation-source"] == "Nasal/oral swab"
        row_count += 1
    assert row_count == len(samples)


async def test_submission_template_download_genbank_MPX(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test MPX tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen = random_pathogen_factory(slug="MPX")
    setup_random_repo_configs(
        async_session,
        pathogen,
        {"GenBank": "hMpxV"},
        split_client=split_client,
        default_repo="GenBank",
    )

    # Make multiple samples
    samples: List[Sample] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                pathogen=pathogen,
                private_identifier=f"private{i}",
                public_identifier=f"public{i}",
            )
        )
        async_session.add(
            uploaded_pathogen_genome_factory(
                samples[i]  # , pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GenBank",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/submission_template",
        headers=auth_headers,
        json=request_data,
    )
    expected_filename = f"{today.strftime('%Y%m%d')}_GenBank_metadata.tsv"
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/tsv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )

    file_contents = io.StringIO(str(res.content, encoding="UTF-8"))
    tsvreader = csv.DictReader(file_contents, delimiter="\t")
    assert set(tsvreader.fieldnames) == set(GenBankSubmissionFormTSVStreamer.fields)  # type: ignore
    row_count = 0
    for row in tsvreader:
        assert row["Sequence_ID"] == f"hMpxV/{samples[row_count].public_identifier}"
        assert row["collection-date"] == samples[row_count].collection_date.strftime(
            "%Y-%m-%d"
        )
        assert row["country"] == "USA: California, Santa Barbara County"
        assert row["isolation-source"] == "clinical"
        row_count += 1
    assert row_count == len(samples)


async def test_submission_template_prefix_stripping(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    pathogen, _ = setup_gisaid_and_genbank_repo_configs(
        async_session, split_client=split_client, default_repo="GISAID"
    )

    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                pathogen=pathogen,
                private=True,
                private_identifier=f"hCoV-19/private{i}",
                public_identifier=f"hCoV-19/public{i}",
            )
        )
        async_session.add(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/submission_template",
        headers=auth_headers,
        json=request_data,
    )
    expected_filename = f"{today.strftime('%Y%m%d')}_GISAID_metadata.csv"
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/csv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )

    file_contents = io.StringIO(str(res.content, encoding="UTF-8"))
    tsvreader = csv.DictReader(file_contents, delimiter=",")
    assert set(list(tsvreader.fieldnames)) == set(  # type: ignore
        GisaidSubmissionFormCSVStreamer.fields
    )
    tsvreader.__next__()  # skip human-readable headers
    row_count = 0
    for row in tsvreader:
        assert row["fn"] == f"{today.strftime('%Y%m%d')}_GISAID_sequences.fasta"
        assert (
            row["covv_virus_name"]
            == samples[
                row_count
            ].public_identifier  # should be the same since they have the hCoV-19 prefix in the db
        )
        assert row["covv_collection_date"] == samples[
            row_count
        ].collection_date.strftime("%Y-%m-%d")
        assert row["covv_subm_lab"] == group.name
        assert row["covv_subm_lab_addr"] == group.address
        row_count += 1
    assert row_count == len(samples)


async def test_submission_template_incomplete_location(
    async_session: AsyncSession,
    http_client: AsyncClient,
    split_client: SplitClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory("North America", "USA", "California")

    pathogen, pathogen_repo_config = setup_gisaid_and_genbank_repo_configs(
        async_session, split_client=split_client, default_repo="GISAID"
    )

    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                pathogen=pathogen,
                private_identifier=f"{pathogen_repo_config.prefix}/private{i}",
                public_identifier=f"{pathogen_repo_config.prefix}/public{i}",
            )
        )
        async_session.add(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/pathogens/{pathogen.slug}/samples/submission_template",
        headers=auth_headers,
        json=request_data,
    )

    expected_filename = f"{today.strftime('%Y%m%d')}_GISAID_metadata.csv"
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/csv"
    assert (
        res.headers["Content-Disposition"]
        == f"attachment; filename={expected_filename}"
    )

    file_contents = io.StringIO(str(res.content, encoding="UTF-8"))
    tsvreader = csv.DictReader(file_contents, delimiter=",")
    assert set(list(tsvreader.fieldnames)) == set(  # type: ignore
        GisaidSubmissionFormCSVStreamer.fields
    )
    tsvreader.__next__()  # skip human-readable headers
    row_count = 0
    for row in tsvreader:
        assert row["fn"] == f"{today.strftime('%Y%m%d')}_GISAID_sequences.fasta"
        assert (
            row["covv_virus_name"]
            == samples[
                row_count
            ].public_identifier  # should be the same since they have the hCoV-19 prefix in the db
        )
        assert row["covv_collection_date"] == samples[
            row_count
        ].collection_date.strftime("%Y-%m-%d")
        assert row["covv_subm_lab"] == group.name
        assert row["covv_subm_lab_addr"] == group.address
        assert row["covv_location"] == "North America / USA / California / None"
        row_count += 1
    assert row_count == len(samples)
