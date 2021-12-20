from aspen.database.models import Location


def location_factory(
    location,
    division="California",
    country="USA",
    region="North America",
) -> Location:
    return Location(
        region=region, country=country, division=division, location=location
    )
