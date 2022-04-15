import json
import os
import re
from typing import Dict, Mapping, Optional, Set, Tuple

import boto3
import sqlalchemy as sa
from sqlalchemy import asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.expression import and_

from aspen.api.error import http_exceptions as ex
from aspen.api.utils import authz_phylo_tree_filters
from aspen.database.models import (
    DataType,
    Group,
    Location,
    PhyloRun,
    PhyloTree,
    Sample,
    User,
)

NEXTSTRAIN_COLOR_SCALE = [
    "#571EA2",
    "#4334BF",
    "#3F55CE",
    "#4376CD",
    "#4C91C0",
    "#59A4A9",
    "#6AB18F",
    "#7FB975",
    "#97BD5F",
    "#AFBD4F",
    "#C7B944",
    "#D9AD3D",
    "#E49838",
    "#E67932",
    "#E1512A",
    "#DB2823",
]


def _rename_nodes_on_tree(
    node: dict,
    name_map: Mapping[str, str],
    save_key: Optional[str] = None,
) -> dict:
    """Given a tree, a mapping of identifiers to their replacements, rename the nodes on
    the tree.  If `save_key` is provided, then the original identifier is saved using
    that as the key."""
    name = node["name"]
    renamed_value = name_map.get(name, None)
    if renamed_value is not None:
        # we found the replacement value! first, save the old value if the caller
        # requested.
        if save_key is not None:
            node[save_key] = name
        node["name"] = renamed_value
    for child in node.get("children", []):
        _rename_nodes_on_tree(child, name_map, save_key)
    return node


async def verify_and_access_phylo_tree(
    db: AsyncSession, user: User, phylo_tree_id: int, load_samples: bool = False
) -> Tuple[bool, Optional[PhyloTree], Optional[PhyloRun]]:
    tree_query = sa.select(PhyloTree).join(PhyloRun)  # type: ignore
    if load_samples:
        tree_query = tree_query.options(selectinload(PhyloTree.constituent_samples))  # type: ignore
    authz_tree_query = authz_phylo_tree_filters(tree_query, user, set([phylo_tree_id]))  # type: ignore
    authz_tree_query_result = await db.execute(authz_tree_query)
    phylo_tree: Optional[PhyloTree]
    try:
        phylo_tree = authz_tree_query_result.scalars().unique().one()
    except sa.exc.NoResultFound:  # type: ignore
        return False, None, None
    run_query = sa.select(PhyloRun).join(PhyloTree).filter(PhyloTree.entity_id == phylo_tree.entity_id).options(selectinload(PhyloRun.group).joinedload(Group.default_tree_location))  # type: ignore
    run_query_result = await db.execute(run_query)
    phylo_run: Optional[PhyloRun]
    phylo_run = run_query_result.scalars().unique().one()
    return True, phylo_tree, phylo_run


def _sample_filter(sample: Sample, can_see_pi_group_ids: Set[int], system_admin: bool):
    if system_admin:
        return True
    return sample.submitting_group_id in can_see_pi_group_ids


# set which countries will be given color labels in the nextstrain viewer
def _set_countries(db: AsyncSession, tree_json: dict, phylo_run: PhyloRun):
    # information stored in tree_json["meta"]["colorings"], which is an
    # array of objects. we grab the index of the one for "country"
    country_defines_index = None
    for index, category in enumerate(tree_json["meta"]["colorings"]):
        if category["key"] == "country":
            country_defines_index = index

    # Next we grab the tree's country and the nearest 15 countries
    tree_location = phylo_run.group.default_tree_location
    # this is where the geolocation query would go, until then hardcode it
    # assuming United States (USA)
    # countries = [
    #     tree_location.country,
    #     "Canada",
    #     "Mexico",
    #     "Cuba",
    #     "Guatemala",
    #     "Belize",
    #     "Honduras",
    #     "El Salvador",
    #     "Haiti",
    #     "Dominican Republic",
    #     "Jamaica",
    #     "Bahamas",
    #     "Bermuda",
    #     "Nicaragua",
    #     "Costa Rica",
    #     "Panama",
    # ]
    origin_subq = (
        sa.select(Location.country, Location.latitude, Location.longitude)
        .where(
            and_(
                Location.division == None,
                Location.location == None,
                Location.country == tree_location.country,
            )
        )
        .subquery()
        .lateral()
    )  # noqa: E711
    countries_subq = (
        sa.select(Location.country, Location.latitude, Location.longitude)
        .where(
            and_(
                Location.division == None,
                Location.location == None,
                Location.country != tree_location.country,
            )
        )
        .subquery()
    )  # noqa: E711
    neighbors_query = (
        sa.select(
            countries_subq.c.country,
            sa.func.earth_distance(
                sa.func.ll_to_earth(
                    countries_subq.c.latitude, countries_subq.c.longitude
                ),
                sa.func.ll_to_earth(origin_subq.c.latitude, origin_subq.c.longitude),
            ).label("distance"),
        )
        .order_by(asc("distance"))
        .limit(15)
    )

    await db.execute(neighbors_query)

    colorings_entry = list(zip(countries, NEXTSTRAIN_COLOR_SCALE))

    if country_defines_index:
        tree_json["meta"]["colorings"][country_defines_index]["scale"] = colorings_entry
    else:
        tree_json["meta"]["colorings"].push(
            {
                "key": "country",
                "title": "Country",
                "type": "categorical",
                "scale": colorings_entry,
            }
        )

    return tree_json


async def process_phylo_tree(
    db: AsyncSession, user: User, phylo_tree_id: int, id_style: Optional[str] = None
) -> dict:
    (
        authorized,
        phylo_tree_result,
        phylo_run_result,
    ) = await verify_and_access_phylo_tree(db, user, phylo_tree_id, load_samples=True)
    if not authorized or not phylo_tree_result:
        raise ex.BadRequestException(
            f"PhyloTree with id {phylo_tree_id} not viewable by user with id: {user.id}"
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
        return json_data

    can_see_pi_group_ids: Set[int] = {user.group_id}
    if not user.system_admin:
        can_see_pi_group_ids.update(
            {
                can_see.owner_group_id
                for can_see in user.group.can_see
                if can_see.data_type == DataType.PRIVATE_IDENTIFIERS
            }
        )

    # If this tree was generated by a group that the user has private-identifier
    # read access to, then load a map of ALL public:private identifiers for that
    # group so we can translate public ID's to private ID's on the tree.
    identifier_map: Dict[str, str] = {}
    tree_owner_group = phylo_run.group
    all_translatable_samples: list[Sample] = []
    if user.system_admin or tree_owner_group.id in can_see_pi_group_ids:
        all_translatable_samples_query = sa.select(Sample).where(  # type: ignore
            Sample.submitting_group == tree_owner_group
        )
        all_translatable_samples_result = await db.execute(
            all_translatable_samples_query
        )
        all_translatable_samples = all_translatable_samples_result.scalars().all()
        for sample in all_translatable_samples:
            public_id = sample.public_identifier.replace("hCoV-19/", "")
            identifier_map[public_id] = sample.private_identifier

    # we pass in the root node of the tree to the recursive naming function.
    json_data["tree"] = _rename_nodes_on_tree(
        json_data["tree"], identifier_map, "GISAID_ID"
    )

    # set country labeling/colors
    json_data = _set_countries(json_data, phylo_run)

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
