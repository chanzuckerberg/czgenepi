#!/bin/bash

# TODO: fix pipefail flags to be informative
#set -Eex pipefail

# activate miniconda
eval "$($HOME/miniconda/bin/conda shell.bash hook)"
conda init
conda activate pangolin

# record pangolin version:
PANGOLIN_VERSION=$(pangolin -pv)

/usr/local/bin/python3.9 find_samples.py \
  --pangolin-version "$PANGOLIN_VERSION"