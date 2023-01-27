"""Runs a refresh stale job for every pathogen."""
import sqlalchemy as sa

from aspen.api.settings import CLISettings
from aspen.config.config import Config
from aspen.database.connection import (
    get_db_uri,
    init_db,
    session_scope,
    SqlAlchemyInterface,
)
from aspen.database.models import Pathogen
from aspen.util.swipe import LineageQcScheduledJob


def launch_refresh_jobs_for_all_pathogens():
    print("Preparing to launch refresh jobs for all pathogens.")
    print("Getting slugs for all pathogens.")
    all_pathogen_slugs = get_all_pathogen_slugs()
    print(f"Found following pathogen slugs: {all_pathogen_slugs}")
    launch_refresh_jobs(all_pathogen_slugs)
    print("Done.")


def get_all_pathogen_slugs() -> list[str]:
    """Connects to DB, gets `slug`s for all pathogens in DB."""
    interface: SqlAlchemyInterface = init_db(get_db_uri(Config()))
    with session_scope(interface) as session:
        all_pathogens_q = sa.select(Pathogen)
        all_pathogens: list[Pathogen] = session.execute(all_pathogens_q).scalars()
        return [pathogen.slug for pathogen in all_pathogens]


def launch_refresh_jobs(pathogen_slugs: list[str]):
    """Kicks off a refresh stale job for each pathogen provided."""
    settings = CLISettings()
    for pathogen_slug in pathogen_slugs:
        print(f"Launching refresh job for pathogen {pathogen_slug}")
        job = LineageQcScheduledJob(settings)
        job.run(
            group=None,
            pathogen_slug=pathogen_slug,
        )


if __name__ == '__main__':
    launch_refresh_jobs_for_all_pathogens()
