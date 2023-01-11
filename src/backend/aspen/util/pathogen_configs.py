from typing import Any, Dict


def get_lineage_urls(pathogen_slug: str) -> Dict[str, Any]:
    urls = {
        "MPX": {
            "url": "https://raw.githubusercontent.com/mpxv-lineages/lineage-designation/master/auto-generated/lineages.json",
            "format": "json",
            "list_path": ["lineages"],
            "lineage_keys": ["name", "alias"],
        }
    }
    if not urls.get(pathogen_slug):
        raise RuntimeError(f"Pathogen slug '{pathogen_slug}' not supported")
    return urls[pathogen_slug]
