import re
from typing import List, Set

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.database.models import PangoLineage

NEXTSTRAIN_LINEAGE_MAP = {
    "BA.1*": "21K",
    "BA.2*": "21L",
    "BA.4*": "22A",
    "BA.5*": "22B",
}

WHO_LINEAGE_MAP = {
    "Delta": ["B.1.617.2*", "AY*"],
    "Omicron": ["B.1.1.529*", "BA*"],
}


def expand_lineage_wildcards(all_lineages: Set[str], lineage_list: List[str]):
    """
    Takes in a set of all lineages and a list of wildcard lineage expressions
    (as strings) and returns a list of specific lineages. Wildcards are
    expanded to include both the base expression and all sublineages.

    Example:
    We encounter the wildcard expression 'BA.1*'.
    We add:
    'BA.1'
    'BA.1.1'
    'BA.1.1.7',
    etc., but not 'BA.11'.
    """
    # Expand WHO aliases
    who_mapped_lineage_list = []
    for entry in lineage_list:
        if entry in WHO_LINEAGE_MAP:
            who_mapped_lineage_list.extend(WHO_LINEAGE_MAP[entry])
        else:
            who_mapped_lineage_list.append(entry)

    expanded_lineage_list = set()
    for entry in who_mapped_lineage_list:
        # strip any tacked-on identifiers like "21K"
        base_entry = entry.partition(" ")[0]
        # Check for a wildcard entry
        wildcard_base_match = re.match(r".+(?=\*$)", base_entry)
        if not wildcard_base_match:
            expanded_lineage_list.add(entry)
            continue
        wildcard_base = wildcard_base_match.group(0)
        for lineage in all_lineages:
            if lineage == wildcard_base or lineage.startswith(f"{wildcard_base}."):
                expanded_lineage_list.add(lineage)
    return list(expanded_lineage_list)
