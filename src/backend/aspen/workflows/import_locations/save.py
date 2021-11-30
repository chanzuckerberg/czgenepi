import asyncio

import click
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as postgresql

from aspen.api.settings import Settings
from aspen.config.config import Config
from aspen.database.connection import init_async_db
from aspen.database.models import GisaidMetadata, Location


async def save():
    settings = Settings()
    db = init_async_db(settings.DB_DSN)

    async with db.make_session() as session:
        # Insert all locations from gisaid_metadata
        gisaid_locations_select = sa.select(
            GisaidMetadata.region,
            GisaidMetadata.country,
            GisaidMetadata.division,
            GisaidMetadata.location,
        ).distinct()
        gisaid_locations_insert = (
            postgresql.insert(Location.__table__)
            .from_select(
                ["region", "country", "division", "location"], gisaid_locations_select
            )
            .on_conflict_do_nothing(
                index_elements=("region", "country", "division", "location")
            )
        )
        await session.execute(gisaid_locations_insert)

        # Make sure we have equivalent rows for region/country/division but with null locations
        except_select = (
            sa.select(Location.region, Location.country, Location.division)
            .where(Location.location == None)
            .distinct()
        )
        null_locations_select = (
            sa.select(Location.region, Location.country, Location.division)
            .distinct()
            .except_(except_select)
        )
        null_locations_insert = Location.__table__.insert().from_select(
            ["region", "country", "division"], null_locations_select
        )
        await session.execute(null_locations_insert)

        await session.commit()

    print("Successfully imported locations!")


@click.command("save")
@click.option("--test", type=bool, is_flag=True)
def cli(test: bool):
    if test:
        print("Success!")
        return
    asyncio.run(save())


if __name__ == "__main__":
    cli()
