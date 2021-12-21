#!/bin/bash -e
python3 /usr/src/app/aspen/workflows/nextstrain_run/export.py --test --phylo-run-id 1234 --builds-file test.txt --sequences test.fasta --metadata test.tsv --selected include.txt
python3 /usr/src/app/aspen/workflows/nextstrain_run/error.py --test --phylo-run-id 1234 --end-time 1234
touch test.txt
python3 /usr/src/app/aspen/workflows/nextstrain_run/save.py --test --aspen-workflow-rev test --aspen-creation-rev test --ncov-rev test --aspen-docker-image-version test --end-time 1234 --phylo-run-id 1234 --bucket test --key test --tree-path test.txt
