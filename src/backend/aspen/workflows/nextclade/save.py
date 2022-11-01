import csv
import io
from datetime import datetime
from re import S
from typing import Mapping, Optional, Union
import sqlalchemy as sa

import click
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import PathogenGenome, UploadedPathogenGenome, SampleQCMetric, Sample, SampleMutation, Group, SampleLineage, LineageType



def create_model_if_not_exists(session, model_class, sample, **kwargs):
    filters = [getattr(model_class, k)==v for k, v in kwargs.items()]
    jt = session.query(model_class).filter(and_(*filters)).one_or_none()

    if jt:
        print(f"{model_class} already exists with kwargs: {kwargs}")
        return jt


    model = model_class(
        **kwargs
    )
    session.add(model)
    return model



@click.command("save")
@click.option("nextclade_fh", "--nextclade-csv", type=click.File("r"), required=True)
@click.option("nextclade_version", "--nextclade-version", type=str, required=True)
@click.option("group_name", "--group-name", type=str, required=True)
@click.option("pathogen_slug", "--pathogen-slug", type=str, required=True)
def cli(nextclade_fh: io.TextIOBase, nextclade_version: str, group_name: str, pathogen_slug: str):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))

    with session_scope(interface) as session:
        nextclade_csv: csv.DictReader = csv.DictReader(nextclade_fh, delimiter=';')
        for row in nextclade_csv:
            sample_q = sa.select(Sample).join(Sample.submitting_group).filter(and_(
                Sample.public_identifier == row['seqName'],
                Group.name == group_name
                )
            )
            sample = session.execute(sample_q).scalars().one()

            existing_qc_metric_q = sa.select(SampleQCMetric).join(SampleQCMetric.sample).filter(
                sample == sample
            )
            qc_metric = session.execute(existing_qc_metric_q).scalars().one_or_none()

            if not qc_metric: 
                qc_metric = SampleQCMetric(
                    sample=sample,
                    qc_score=row["qc.overallScore"],
                    qc_status=row["qc.overallStatus"],
                    raw_qc_output ={key: value for key, value in row.items()},
                    qc_software_version=nextclade_version
                )
            else:
                qc_metric.qc_score = row["qc.overallScore"]
                qc_metric.qc_status = row["qc.overallStatus"]
                qc_metric.raw_qc_output = {key: value for key, value in row.items()}
                qc_metric.qc_software_version = nextclade_version

            session.add(qc_metric)

            existing_mutation_q = sa.select(SampleMutation).join(SampleMutation.sample).filter(
                sample == sample
            )
            mutation = session.execute(existing_mutation_q).scalars().one_or_none()
            if not mutation:
                mutation = SampleMutation(
                    sample=sample,
                    substitutions = row["substitutions"],
                    insertions = row["insertions"],
                    deletions = row["deletions"],
                    aa_substitutions = row["aaSubstitutions"],
                    aa_insertions = row["aaInsertions"],
                    aa_deletions = row["aaDeletions"]
                )
            else:
                mutation.substitutions = row["substitutions"]
                mutation.insertions = row["insertions"]
                mutation.deletions = row["deletions"]
                mutation.aa_substitutions = row["aaSubstitutions"]
                mutation.aa_insertions = row["aaInsertions"]
                mutation.aa_deletions = row["aaDeletions"]

            session.add(mutation)

            # if not SC2 proceed with filling lineage table with nextclade output 
            if pathogen_slug != "SC2":
                existing_sample_lineage_q = sa.select(SampleLineage).join(SampleLineage.sample).filter(
                    sample == sample
                )
                sample_lineage = session.execute(existing_sample_lineage_q).scalars().one_or_none()
                lineage_type = LineageType.NEXTCLADE
                if not sample_lineage:
                    SampleLineage(
                        sample=sample,
                        lineage_type=LineageType.NEXTCLADE,
                        lineage_software_version=nextclade_version,
                        lineage=row["clade"],
                    )
                else: 
                    sample_lineage.lineage_type=LineageType.NEXTCLADE
                    sample_lineage.lineage_software_version=nextclade_version
                    sample_lineage.lineage=row["clade"]

                session.add(sample_lineage)

        session.commit()


if __name__ == "__main__":
    cli()
