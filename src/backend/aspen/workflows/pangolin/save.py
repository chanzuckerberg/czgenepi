import csv
import io
from datetime import datetime
from typing import Mapping, Union

import click

from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import PathogenGenome, UploadedPathogenGenome


def get_probability(row) -> int:
    """
    Estimate confidence percentage based on the `ambiguity_score`.
    Per pangolin docs, this is basically the number of lineage-defining sites
    that had to be imputed from the reference sequence.
    Round and multiply by 100 --> percentage for easier user comprehension.
    """
    if row["ambiguity_score"] != "":
        return round(row["ambiguity_score"] * 100)
    elif "Assigned using designation hash" in row["note"]:
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

    with session_scope(interface) as session:
        pango_csv: csv.DictReader = csv.DictReader(pangolin_fh)
        taxon_to_pango_info: Mapping[int, Mapping[str, Union[str, float, None]]] = {
            int(row["taxon"]): {
                "lineage": row["lineage"],
                "probability": get_probability(row),
                "version": row["pangoLEARN_version"],
            }
            for row in pango_csv
        }

        entity_id_to_pathogen_genome: Mapping[int, UploadedPathogenGenome] = {
            pathogen_genome.entity_id: pathogen_genome
            for pathogen_genome in session.query(PathogenGenome).filter(
                PathogenGenome.entity_id.in_(taxon_to_pango_info.keys())
            )
        }

        for entity_id, pathogen_genome in entity_id_to_pathogen_genome.items():
            pango_info: Mapping[str, Union[str, float, None]] = taxon_to_pango_info[
                entity_id
            ]
            pathogen_genome.pangolin_last_updated = pangolin_last_updated
            pathogen_genome.pangolin_lineage = pango_info["lineage"]  # type: ignore
            pathogen_genome.pangolin_probability = pango_info["probability"]  # type: ignore
            pathogen_genome.pangolin_version = pango_info["version"]  # type: ignore
            session.commit()


if __name__ == "__main__":
    cli()
