from typing import Optional

from aspen.database.models import Location


def location_factory(
    region: str,
    country: str,
    division: str,
    location: Optional[str],
) -> Location:
    return Location(
        region=region, country=country, division=division, location=location
    )
