import json
import os
from typing import Mapping, Optional, Set, Tuple

import boto3
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from aspen.api.error import http_exceptions as ex
from aspen.api.utils import authz_phylo_tree_filters
from aspen.database.models import DataType, PhyloRun, PhyloTree, Sample, User


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
    run_query = sa.select(PhyloRun).join(PhyloTree).filter(PhyloTree.entity_id == phylo_tree.entity_id).options(selectinload(PhyloRun.group))  # type: ignore
    run_query_result = await db.execute(run_query)
    phylo_run: Optional[PhyloRun]
    phylo_run = run_query_result.scalars().unique().one()
    return True, phylo_tree, phylo_run


def _sample_filter(sample: Sample, can_see_pi_group_ids: Set[int], system_admin: bool):
    if system_admin:
        return True
    return sample.submitting_group_id in can_see_pi_group_ids


async def process_phylo_tree(
    db: AsyncSession, user: User, phylo_tree_id: int, id_style: Optional[str] = None
) -> dict:
    (
        authorized,
        phylo_tree_result,
        phylo_run_result,
    ) = await verify_and_access_phylo_tree(db, user, phylo_tree_id, load_samples=True)
    if not authorized or not phylo_tree_result:
        raise ex.BadRequestException("No phylo run found for auspice request")
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
    if user.system_admin or tree_owner_group.id in can_see_pi_group_ids:
        all_translatable_samples = [
            sample
            for sample in phylo_tree.constituent_samples
            if sample.submitting_group_id == tree_owner_group.id
        ]
        for sample in all_translatable_samples:
            public_id = sample.public_identifier.replace("hCoV-19/", "")
            identifier_map[public_id] = sample.private_identifier

    # we pass in the root node of the tree to the recursive naming function.
    json_data["tree"] = _rename_nodes_on_tree(
        json_data["tree"], identifier_map, "GISAID_ID"
    )

    return json_data
