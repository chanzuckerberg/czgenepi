from copy import deepcopy
from typing import Any, Dict

from aspen.database.models import PhyloTree


def create_id_mapped_tree(input_json: dict) -> dict:
    clone = deepcopy(input_json)
    for node in clone["tree"]["children"]:
        node["GISAID_ID"] = node["name"]
        node["name"] = node["name"].replace("public", "private")
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
