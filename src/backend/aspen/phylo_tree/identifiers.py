from typing import Mapping, Optional, Set


def get_names_from_tree(tree) -> Set[str]:
    results: Set[str] = set()
    for node in tree:
        results.add(node["name"])
        if "children" in node:
            results.update(get_names_from_tree(node["children"]))

    return results
