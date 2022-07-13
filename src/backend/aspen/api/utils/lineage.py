import re
from typing import List

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import PangoLineage

"""
Takes in a list of lineages and wildcard lineage expressions (as strings) and
returns a list of specific lineages. Wildcards are expanded to include both
the base expression and all sublineages.

Example:
We encounter the wildcard expression 'BA.1.*'.
We add:
'BA.1'
'BA.1.1'
'BA.1.1.7',
etc.

but not 'BA.11'.
"""


async def expand_lineage_wildcards(db: AsyncSession, lineage_list: List[str]):
    all_lineages_query = sa.select(PangoLineage.lineage)  # type: ignore
    result = await db.execute(all_lineages_query)
    all_lineages = set(result.scalars().all())

    expanded_lineage_list = set()
    for entry in lineage_list:
        wildcard_base_match = re.match(r".+(?=\.\*$)", entry)
        if not wildcard_base_match:
            expanded_lineage_list.add(entry)
            continue
        wildcard_base = wildcard_base_match.group(0)
        for lineage in all_lineages:
            if lineage == wildcard_base or lineage.startswith(f"{wildcard_base}."):
                expanded_lineage_list.add(lineage)

    return list(expanded_lineage_list)
