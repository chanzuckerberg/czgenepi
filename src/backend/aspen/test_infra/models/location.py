from aspen.database.models import Location


def location_factory(
    region,
    country,
    division,
    location,
) -> Location:
    return Location(
        region=region, country=country, division=division, location=location
    )
