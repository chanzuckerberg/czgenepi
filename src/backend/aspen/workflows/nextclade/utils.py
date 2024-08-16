"""Util functions for working with Nextclade"""

import json
from typing import Dict, IO


def extract_dataset_info(nextclade_tag_fh: IO[str]) -> Dict[str, str]:
    """Extracts important info from `tag.json` file of a nextclade dataset.

    A Nextclade dataset provides a `tag.json` file with various pieces of info
    on that specific dataset bundle.
    https://docs.nextstrain.org/projects/nextclade/en/stable/user/datasets.html
    We want to know certain key pieces of info because they let us know the
    provenance of a lineage/QC/mutations call when using Nextclade. We also
    need that info to determine if a given call is stale or not.

    Those pieces of info are
        - name: The Nextclade name for the dataset bundle, eg "sars-cov-2"
            (Note, a given pathogen can have multiple of these with different
            meaning. For example, "sars-cov-2-no-recomb" also pertains to the
            same pathogen, but focuses the dataset on different aspects.)
        - accession: The underlying reference genome's id, eg "MN908947"
        - tag: The version of overall dataset bundle, eg "2022-11-15T12:00:00Z"
    """
    nextclade_tag = json.load(nextclade_tag_fh)
    return {
        "name": nextclade_tag["attributes"]["name"],
        "accession": nextclade_tag["attributes"]["reference accession"],
        "tag": nextclade_tag["version"]["tag"],
    }
