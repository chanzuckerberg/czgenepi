#!/bin/bash

eval "$($HOME/miniconda/bin/conda shell.bash hook)"
conda init
mkdir /pangolin
cd /pangolin
git clone git://github.com/cov-lineages/pangolin.git --depth 1 .
conda env create -f environment.yml
conda activate pangolin
pip install .

# check pangolin is present:
pangolin -pv