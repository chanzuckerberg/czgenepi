#!/bin/bash -e
cd /usr/src/app/aspen/workflows/pangolin
/usr/local/bin/python3.9 find_samples.py --test

cd /usr/src/app/aspen/workflows/import_pango_lineages
# Script has a required file arg, so make a dummy to be able to run smoke test
touch test.txt
/usr/local/bin/python3.9 load_lineages.py --test --lineages-file test.txt
