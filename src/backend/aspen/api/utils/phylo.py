import json
import os
import re
from collections import namedtuple
from typing import Dict, Mapping, Optional, Set, Tuple

import boto3
import sqlalchemy as sa
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload, selectinload
from sqlalchemy.sql.expression import and_, or_

from aspen.api.authz import AuthZSession
from aspen.api.error import http_exceptions as ex
from aspen.database.models import Group, Location, Pathogen, PhyloRun, PhyloTree, Sample

# 16 colors
NEXTSTRAIN_COLOR_SCALE = [
    "#277F8E",
    "#084A9F",
    "#4187E0",
    "#B2D3FD",
    "#DFC6FF",
    "#9069C2",
    "#440278",
    "#BD3232",
    "#ED5151",
    "#FF9999",
    "#FF8A24",
    "#FFDABA",
    "#A76738",
    "#FDE725",
    "#A0DA39",
    "#4AB569",
]


ExtractedLocation = namedtuple("ExtractedLocation", ("country", "division", "location"))
LOCATION_KEYS = ExtractedLocation._fields

CATEGORY_NAMES = {
    "country": "Country",
    "division": "Admin Division",
    "location": "Location",
}


def _rename_nodes_on_tree(
    node: dict,
    name_map: Mapping[str, str],
    save_key: Optional[str] = None,
) -> dict:
    """Given a tree, a mapping of identifiers to their replacements, rename the nodes on
    the tree.  If `save_key` is provided, then the original identifier is saved using
    that as the key."""
    gisaid_prefix = "hCoV-19/"

    # The mixed situations we're dealing with here:
    #  - The public identifiers in our database *sometimes* have gisaid prefixes on them
    #  - The samples on a tree *sometimes* have gisaid prefixes on them.
    #  - We want to match identifiers from trees and the db with the prefix *stripped*
    #  - At the end of this method, we want *all* tree samples to have gisaid prefixes on them.
    # So this means we have to:
    #  - Strip gisaid prefixes from tree nodes before trying to match them to db samples
    #  - Add gisaid prefixes to all public tree identifiers if they aren't already prefixed

    # Strip the gisaid prefix from our tree identifier if it's present
    tree_identifier = node["name"]
    if tree_identifier.lower().startswith(gisaid_prefix.lower()):
        tree_identifier = tree_identifier[len(gisaid_prefix) :]

    renamed_value = name_map.get(tree_identifier, None)

    # Make sure we have the gisaid prefix on this node when we output it.
    node["name"] = (
        f"{gisaid_prefix}{tree_identifier}"
        if not tree_identifier.startswith("NODE_")
        else tree_identifier
    )
    if renamed_value is not None:
        # we found the replacement value! first, save the old value if the caller
        # requested.
        if save_key is not None:
            node[save_key] = node["name"]
        node["name"] = renamed_value
    for child in node.get("children", []):
        _rename_nodes_on_tree(child, name_map, save_key)
    return node


async def verify_and_access_phylo_tree(
    db: AsyncSession,
    az: AuthZSession,
    phylo_tree_id: int,
    pathogen: Pathogen,
    load_samples: bool = False,
) -> Tuple[bool, Optional[PhyloTree], Optional[PhyloRun]]:
    tree_query = (await az.authorized_query("read", PhyloTree)).join(PhyloRun)  # type: ignore
    if load_samples:
        tree_query = tree_query.options(selectinload(PhyloTree.constituent_samples), joinedload(PhyloTree.pathogen))  # type: ignore
    tree_query = tree_query.filter(PhyloTree.entity_id.in_({phylo_tree_id}))  # type: ignore
    tree_query = tree_query.filter(PhyloTree.pathogen == pathogen)  # type: ignore
    authz_tree_query_result = await db.execute(tree_query)
    phylo_tree: Optional[PhyloTree] = (
        authz_tree_query_result.scalars().unique().one_or_none()
    )
    if not phylo_tree:
        # Either the tree doesn't exist or we don't have access to it.
        return False, None, None
    run_query = (
        (await az.authorized_query("read", PhyloRun))
        .filter(PhyloRun.id == phylo_tree.producing_workflow_id)
        .options(
            selectinload(PhyloRun.group).joinedload(Group.default_tree_location),
            joinedload(PhyloRun.pathogen),
        )
    )  # type: ignore
    run_query_result = await db.execute(run_query)
    phylo_run: Optional[PhyloRun]
    phylo_run = run_query_result.scalars().unique().one()
    return True, phylo_tree, phylo_run


def _collect_locations(node: dict) -> Set[ExtractedLocation]:
    locations = set()
    extracted_location_list = [
        node.get("node_attrs", {}).get(key, {}).get("value", None)
        for key in LOCATION_KEYS
    ]
    locations.add(ExtractedLocation(*extracted_location_list))
    for child in node.get("children", []):
        locations |= _collect_locations(child)
    return locations


# set which locations will be given color labels in the nextstrain viewer
# keep in mind that the color categories are very simple and are not
# interconnected with one another.
# noqa: E711 is vital for the SQL query to compile correctly.
async def _set_colors_for_location_category(
    db: AsyncSession,
    tree_json: dict,
    tree_location: Location,
    extracted_locations: Set[ExtractedLocation],
    category: str,
) -> dict:
    # information stored in tree_json["meta"]["colorings"], which is an
    # array of objects. we grab the index of the one for "{category}"
    category_defines_index = None
    for index, defines in enumerate(tree_json["meta"]["colorings"]):
        if defines["key"] == category:
            category_defines_index = index

    and_clauses = []
    if category == "country":
        # Make sure we only have country-level locations in our set.
        sample_locations = {
            ExtractedLocation(country=loc.country, division=None, location=None)
            for loc in extracted_locations
        }
    elif category == "division":
        # Make sure we only have division-level locations in our set.
        sample_locations = {
            ExtractedLocation(country=loc.country, division=loc.division, location=None)
            for loc in extracted_locations
            if loc.division is not None
        }
    else:
        sample_locations = {
            ExtractedLocation(
                country=loc.country, division=loc.division, location=loc.location
            )
            for loc in extracted_locations
            if loc.location is not None
        }
    # This builds up a list of SQL filters that looks like this:
    #  location.country = 'USA' AND location.division = 'CA' AND location.location = 'San Francisco'
    # Or for division-level locations for example:
    #  location.country = 'USA' AND location.division = 'CA' AND location.location IS NULL
    for location in sample_locations:
        and_clauses.append(
            and_(
                Location.country == location.country,
                Location.division == location.division,
                Location.location == location.location,
            )
        )

    # If we didn't find any locations on the tree, we probably have bigger problems
    if not and_clauses:
        return tree_json

    origin_location = aliased(Location)
    sorting_query = (
        sa.select(  # type: ignore
            getattr(Location, category),
            sa.func.earth_distance(
                sa.func.ll_to_earth(Location.latitude, Location.longitude),
                sa.func.ll_to_earth(
                    origin_location.latitude, origin_location.longitude
                ),
            ).label("distance"),
        )
        .select_from(origin_location)  # type: ignore
        .join(
            Location,  # type: ignore
            or_(*and_clauses),
        )
        .where(
            and_(
                origin_location.country == tree_location.country,
                origin_location.division == tree_location.division,
                origin_location.location == tree_location.location,
            )
        )
        .order_by(asc("distance"))
        .limit(16)
    )

    sorted_locations_result = await db.execute(sorting_query)
    sorted_locations = [row[category] for row in sorted_locations_result]

    # Add the locations we found location data for
    # If we still have fewer than 16, add whatever is left from the set we collected
    # in the tree, even if we don't have spatial data on them.
    location_strings = [getattr(tree_location, category)]
    location_strings.extend(
        [location for location in sorted_locations if location not in location_strings]
    )
    if len(location_strings) < 16:
        remaining_category_locs_in_tree = set(
            [
                getattr(loc, category)
                for loc in extracted_locations
                if getattr(loc, category) not in location_strings
                and getattr(loc, category) is not None
            ]
        )
        location_strings.extend(
            list(remaining_category_locs_in_tree)[: 16 - len(location_strings)]
        )

    colorings_entry = list(zip(location_strings, NEXTSTRAIN_COLOR_SCALE))

    if category_defines_index is not None:
        tree_json["meta"]["colorings"][category_defines_index][
            "scale"
        ] = colorings_entry
    else:
        tree_json["meta"]["colorings"].append(
            {
                "key": category,
                "title": CATEGORY_NAMES[category],
                "type": "categorical",
                "scale": colorings_entry,
            }
        )

    return tree_json


async def _set_colors(db: AsyncSession, tree_json: dict, phylo_run: PhyloRun) -> dict:
    extracted_locations = _collect_locations(tree_json["tree"])
    tree_location = phylo_run.group.default_tree_location
    for key in LOCATION_KEYS:
        tree_json = await _set_colors_for_location_category(
            db, tree_json, tree_location, extracted_locations, key
        )

    return tree_json


async def process_phylo_tree(
    db: AsyncSession,
    az: AuthZSession,
    phylo_tree_id: int,
    pathogen: Pathogen,
    id_style: Optional[str] = None,
) -> dict:
    (
        authorized,
        phylo_tree_result,
        phylo_run_result,
    ) = await verify_and_access_phylo_tree(
        db, az, phylo_tree_id, pathogen, load_samples=True
    )
    if not authorized or not phylo_tree_result:
        raise ex.BadRequestException(
            f"PhyloTree with id {phylo_tree_id} not viewable by user"
        )
    if not phylo_run_result:
        raise ex.ServerException(f"No phylo run found for phylo tree {phylo_tree_id}")
    phylo_tree: PhyloTree = phylo_tree_result
    phylo_run: PhyloRun = phylo_run_result

    s3 = boto3.resource(
        "s3",
        endpoint_url=os.getenv("BOTO_ENDPOINT_URL") or None,
        config=boto3.session.Config(signature_version="s3v4"),
    )

    data = (
        s3.Bucket(phylo_tree.s3_bucket).Object(phylo_tree.s3_key).get()["Body"].read()
    )
    json_data = json.loads(data)

    if id_style == "public":
        json_data = await _set_colors(db, json_data, phylo_run)
        json_data["tree"] = _rename_nodes_on_tree(json_data["tree"], {}, "GISAID_ID")
        return json_data

    # Load all the public:private sample mappings this user/group has access to.
    # TODO we should limit the query scope here to just the samples on the tree.
    identifier_map: Dict[str, str] = {}
    translatable_samples: list[Sample] = (
        (
            await db.execute(
                await az.authorized_query("read_private", Sample)  # type: ignore
            )
        )
        .scalars()
        .all()
    )
    for sample in translatable_samples:
        public_id = sample.public_identifier.replace("hCoV-19/", "")
        identifier_map[public_id] = sample.private_identifier

    # we pass in the root node of the tree to the recursive naming function.
    json_data["tree"] = _rename_nodes_on_tree(
        json_data["tree"], identifier_map, "GISAID_ID"
    )

    # set country labeling/colors
    json_data = await _set_colors(db, json_data, phylo_run)
    return json_data


def extract_accessions(accessions_list: list, node: dict):
    node_attributes = node.get("node_attrs", {})
    if "external_accession" in node_attributes:
        accessions_list.append(node_attributes["external_accession"]["value"])
    if "name" in node:
        # NODE_ is some sort of generic name and not useful
        if not re.match("NODE_", node["name"]):
            accessions_list.append(node["name"])
    if "children" in node:
        for child in node["children"]:
            extract_accessions(accessions_list, child)
    return accessions_list
