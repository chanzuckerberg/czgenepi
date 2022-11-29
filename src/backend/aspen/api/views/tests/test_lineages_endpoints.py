from typing import Collection, Tuple

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import Group, Pathogen, PathogenLineage, User
from aspen.test_infra.models.pathogen import pathogen_factory, random_pathogen_factory
from aspen.test_infra.models.usergroup import group_factory, userrole_factory

# All test coroutines will be treated as marked.
pytestmark = pytest.mark.asyncio


def make_all_test_data(
    async_session: AsyncSession,
) -> Tuple[
    Pathogen,
    Pathogen,
    Collection[PathogenLineage],
    Collection[PathogenLineage],
]:
    random_pathogen: Pathogen = random_pathogen_factory()
    sc2: Pathogen = pathogen_factory("SC2")

    sc2_lineage_names = ["F.1", "G.1.1", "H.2.3.4"]
    sc2_lineages = []
    for lineage_name in sc2_lineage_names:
        sc2_lineages.append(PathogenLineage(pathogen=sc2, lineage=lineage_name))

    random_lineage_names = ["I.1", "J.1.1", "K.2.3.4"]
    random_pathogen_lineages = []
    for lineage_name in random_lineage_names:
        random_pathogen_lineages.append(
            PathogenLineage(pathogen=random_pathogen, lineage=lineage_name)
        )

    async_session.add_all(sc2_lineages + random_pathogen_lineages)
    return sc2, random_pathogen, sc2_lineages, random_pathogen_lineages


async def test_pango_lineages_list(
    async_session,
    http_client,
    n_samples=5,
    n_trees=3,
):
    group: Group = group_factory()
    user: User = await userrole_factory(async_session, group)
    sc2, _, sc2_lineages, _ = make_all_test_data(async_session)

    async_session.add(group)
    await async_session.commit()

    auth_headers = {"user_id": str(user.auth0_user_id)}
    res = await http_client.get("/v2/lineages/pango", headers=auth_headers)
    results = res.json()["lineages"]
    expected = ["Delta", "F*", "F.1", "G.1*", "G.1.1", "H.2.3*", "H.2.3.4", "Omicron"]

    assert results == expected
