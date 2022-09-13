import csv
import datetime
import io
from typing import Any, List

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.utils import (
    GenBankSubmissionFormTSVStreamer,
    GisaidSubmissionFormCSVStreamer,
)
from aspen.database.models import Sample, UploadedPathogenGenome
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen_repo_config import (
    setup_gisaid_and_genbank_repo_configs,
)
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


async def test_submission_template_download_gisaid(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    setup_gisaid_and_genbank_repo_configs(async_session)
    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    uploaded_pathogen_genomes: List[UploadedPathogenGenome] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                private_identifier=f"private{i}",
                public_identifier=f"public{i}",
            )
        )
        uploaded_pathogen_genomes.append(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    to_add: list[Any] = [user, group, location] + samples  # type: ignore
    async_session.add_all(to_add)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/submission_template",
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
    tsvreader = csv.DictReader(file_contents, delimiter="\t")
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


async def test_submission_template_download_genbank(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    setup_gisaid_and_genbank_repo_configs(async_session)
    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    uploaded_pathogen_genomes: List[UploadedPathogenGenome] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                private_identifier=f"private{i}",
                public_identifier=f"public{i}",
            )
        )
        uploaded_pathogen_genomes.append(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    to_add: list[Any] = [user, group, location] + samples  # type: ignore
    async_session.add_all(to_add)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GenBank",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/submission_template",
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
        row_count += 1
    assert row_count == len(samples)


async def test_submission_template_prefix_stripping(
    async_session: AsyncSession,
    http_client: AsyncClient,
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    setup_gisaid_and_genbank_repo_configs(async_session)
    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    uploaded_pathogen_genomes: List[UploadedPathogenGenome] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                private_identifier=f"hCoV-19/private{i}",
                public_identifier=f"hCoV-19/public{i}",
            )
        )
        uploaded_pathogen_genomes.append(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    to_add: list[Any] = [user, group, location] + samples  # type: ignore
    async_session.add_all(to_add)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/submission_template",
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
    tsvreader = csv.DictReader(file_contents, delimiter="\t")
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
):
    """
    Test a regular tsv download for samples submitted by the user's group
    """
    group = group_factory()
    user = await userrole_factory(async_session, group)
    location = location_factory("North America", "USA", "California")
    setup_gisaid_and_genbank_repo_configs(async_session)
    pangolin_output = {
        "scorpio_call": "B.1.167",
        "scorpio_support": "0.775",
        "qc_status": "pass",
    }
    # Make multiple samples
    samples: List[Sample] = []
    uploaded_pathogen_genomes: List[UploadedPathogenGenome] = []
    for i in range(2):
        samples.append(
            sample_factory(
                group,
                user,
                location,
                private=True,
                private_identifier=f"hCoV-19/private{i}",
                public_identifier=f"hCoV-19/public{i}",
            )
        )
        uploaded_pathogen_genomes.append(
            uploaded_pathogen_genome_factory(
                samples[i], pangolin_output=pangolin_output
            )
        )
    samples.sort(key=lambda sample: sample.public_identifier)
    to_add: list[Any] = [user, group, location] + samples  # type: ignore
    async_session.add_all(to_add)
    await async_session.commit()

    today = datetime.date.today()
    auth_headers = {"name": user.name, "user_id": user.auth0_user_id}
    request_data = {
        "sample_ids": [sample.public_identifier for sample in samples],
        "public_repository_name": "GISAID",
    }
    res = await http_client.post(
        f"/v2/orgs/{group.id}/samples/submission_template",
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
    tsvreader = csv.DictReader(file_contents, delimiter="\t")
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
