from copy import deepcopy
from typing import Any, Dict

from aspen.database.models import PhyloTree


def create_id_mapped_tree(input_json: dict, prefix) -> dict:
    clone = deepcopy(input_json)
    clone["tree"]["name"] = f"{clone['tree']['name']}"
    for node in clone["tree"]["children"]:
        node["GISAID_ID"] = f"{node['name']}"
        node["name"] = node["name"].replace("public", "private")
    return clone


def add_subtree_prefixes(subtree, prefix):
    for node in subtree:
        node["name"] = f"{node['name']}"
        if "children" in node:
            add_subtree_prefixes(node["children"])


def add_prefixes(input_json: dict, prefix: str) -> dict:
    clone = deepcopy(input_json)
    clone["tree"]["name"] = f"{clone['tree']['name']}"
    add_subtree_prefixes(clone["tree"]["children"], prefix)
    return clone


def align_json_with_model(input_json: dict, phylo_tree: PhyloTree) -> dict:
    uploaded_children = []
    for index, sample in enumerate(phylo_tree.constituent_samples):
        child: Dict[str, Any] = dict()
        if index < len(input_json["tree"]["children"]):
            child |= input_json["tree"]["children"][index]
        else:
            child |= {
                "node_attrs": {"country": {"value": "USA"}},
            }
        child |= {"name": sample.public_identifier}
        uploaded_children.append(child)
    input_json["tree"]["children"] = uploaded_children
    return input_json
