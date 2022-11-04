#!/bin/bash -e
/usr/local/bin/python3 /usr/src/app/aspen/workflows/pangolin/find_samples.py --test --output-file dummy.txt

# Script has a required file arg, so make a dummy to be able to run smoke test
touch test.txt
/usr/local/bin/python3 /usr/src/app/aspen/workflows/import_pango_lineages/load_lineages.py --test --lineages-file test.txt
