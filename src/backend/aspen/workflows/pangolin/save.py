import csv
import io
from datetime import datetime
from typing import Mapping, Optional, Union

import click
import sqlalchemy as sa
from sqlalchemy.orm import contains_eager
from sqlalchemy.sql.expression import and_

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import (
    LineageType,
    Sample,
    SampleLineage,
    UploadedPathogenGenome,
)


def get_probability(row: dict) -> Optional[int]:
    """
    Estimate confidence percentage based on the `ambiguity_score`.
    Per pangolin docs, this is basically the number of lineage-defining sites
    that had to be imputed from the reference sequence.
    Round and multiply by 100 --> percentage for easier user comprehension.
    """
    if row["ambiguity_score"]:
        return round(float(row["ambiguity_score"]) * 100)
    elif (
        "Assigned using designation hash" in row["note"]
        or "Assigned from designation hash" in row["note"]
    ):
        return 100
    else:
        return None


@click.command("save")
@click.option("pangolin_fh", "--pangolin-csv", type=click.File("r"), required=True)
@click.option(
    "--pangolin-last-updated", type=click.DateTime(formats=["%m-%d-%Y"]), required=True
)
def cli(pangolin_fh: io.TextIOBase, pangolin_last_updated: datetime):
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    # This script is SC2 only, which uses pangolin for lineage calls.
    lineage_type = LineageType.PANGOLIN

    commit_chunk_size = 100
    current_chunk_size = 0
    with session_scope(interface) as session:
        pango_csv: csv.DictReader = csv.DictReader(pangolin_fh)
        taxon_to_pango_info: Mapping[
            int, Mapping[str, Union[str, float, Mapping, None]]
        ] = {
            int(row["taxon"]): {
                "lineage": row["lineage"],
                "probability": get_probability(row),
                "version": row["version"],
                "full_output": {k: v for k, v in row.items() if v and k != "taxon"},
            }
            for row in pango_csv
        }

        genome_query = (
            sa.select(UploadedPathogenGenome)
            .join(UploadedPathogenGenome.sample)
            .outerjoin(
                SampleLineage,
                and_(
                    Sample.id == SampleLineage.sample_id,
                    SampleLineage.lineage_type == lineage_type,
                ),
            )
            .options(
                contains_eager(UploadedPathogenGenome.sample).contains_eager(
                    Sample.lineages
                )
            )
            .where(UploadedPathogenGenome.entity_id.in_(taxon_to_pango_info.keys()))
        )
        entity_id_to_pathogen_genome: Mapping[int, UploadedPathogenGenome] = {
            pathogen_genome.entity_id: pathogen_genome
            for pathogen_genome in session.execute(genome_query)
            .unique()
            .scalars()
            .all()
        }

        for entity_id, pathogen_genome in entity_id_to_pathogen_genome.items():
            pango_info: Mapping[
                str, Union[str, float, None, Mapping]
            ] = taxon_to_pango_info[entity_id]
            current_chunk_size += 1

            # Support populating the sample_lineages table.
            if pathogen_genome.sample.lineages:
                lineage = pathogen_genome.sample.lineages[0]
                lineage.lineage = pango_info["lineage"]  # type: ignore
                lineage.lineage_software_version = pango_info["version"]  # type: ignore
                lineage.lineage_probability = pango_info["probability"]  # type: ignore
                lineage.raw_lineage_output = pango_info["full_output"]  # type: ignore
                lineage.last_updated = pangolin_last_updated
            else:
                lineage = SampleLineage(
                    sample=pathogen_genome.sample,
                    lineage_type=lineage_type,
                    lineage=pango_info["lineage"],  # type: ignore
                    lineage_software_version=pango_info["version"],  # type: ignore
                    lineage_probability=pango_info["probability"],  # type: ignore
                    raw_lineage_output=pango_info["full_output"],  # type: ignore
                    last_updated=pangolin_last_updated,
                )
                pathogen_genome.sample.lineages.append(lineage)

            if current_chunk_size > commit_chunk_size:
                session.commit()
                current_chunk_size = 0
        session.commit()


if __name__ == "__main__":
    cli()
