from typing import Optional

from aspen.database.models import Location


def location_factory(
    region: Optional[str],
    country: Optional[str],
    division: Optional[str] = None,
    location: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> Location:
    return Location(
        region=region,
        country=country,
        division=division,
        location=location,
        latitude=latitude,
        longitude=longitude,
    )
