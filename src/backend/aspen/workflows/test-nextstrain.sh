#!/bin/bash -e
python3 /usr/src/app/aspen/workflows/nextstrain_run/export.py --test --phylo-run-id 1234 --builds-file test.txt --sequences test.fasta --metadata test.tsv --resolved-template-args /tmp/test.json --selected include.txt
python3 /usr/src/app/aspen/workflows/nextstrain_run/error.py --test --phylo-run-id 1234 --end-time 1234
# Files the `save.py` script assumes it can read from. If not present, errors.
touch test.txt
touch /tmp/test.json
python3 /usr/src/app/aspen/workflows/nextstrain_run/save.py --test --aspen-workflow-rev test --aspen-creation-rev test --ncov-rev test --aspen-docker-image-version test --end-time 1234 --phylo-run-id 1234 --bucket test --key test --resolved-template-args /tmp/test.json --tree-path test.txt
