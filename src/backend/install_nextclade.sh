#!/bin/bash

eval "$($HOME/miniconda/bin/conda shell.bash hook)"
conda init

conda create --name nextclade
conda activate nextclade
conda config --add channels bioconda

# install nextclade
conda install -c bioconda nextclade --yes

# test nextclade installed
nextclade --version

conda deactivate
