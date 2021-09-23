#!/bin/bash

# activate miniconda
eval "$($HOME/miniconda/bin/conda shell.bash hook)"
conda init
cd /pangolin
conda activate pangolin
git pull
conda env update -f environment.yml
pip install .

# check pangolin is present:
pangolin -pv
