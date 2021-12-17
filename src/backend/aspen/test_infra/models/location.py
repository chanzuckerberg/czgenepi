from aspen.database.models import Location


def location_factory(
    region="North America",
    country="USA",
    division="California",
    location="Santa Barbara County",
) -> Location:
    return Location(
        region=region, country=country, division=division, location=location
    )
