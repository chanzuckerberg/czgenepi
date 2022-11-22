#!/bin/bash -e
python3 /usr/src/app/aspen/workflows/ingest_gisaid/save.py --test --start-time 1234 --gisaid-s3-bucket test --gisaid-s3-key test
python3 /usr/src/app/aspen/workflows/transform_gisaid/save.py --test --aspen-workflow-rev test --aspen-creation-rev test --start-time 1234 --end-time 1234 --ncov-ingest-rev test --raw-gisaid-object-id 1234 --gisaid-s3-bucket test --gisaid-sequences-s3-key test --gisaid-metadata-s3-key test
python3 /usr/src/app/aspen/workflows/align_gisaid/save.py --test --aspen-workflow-rev test --aspen-creation-rev test --start-time 1234 --end-time 1234  --ncov-rev test --aspen-docker-image-version test --processed-gisaid-object-id 1234 --gisaid-s3-bucket test --gisaid-sequences-s3-key test --gisaid-metadata-s3-key test
touch test.txt
python3 /usr/src/app/aspen/workflows/import_gisaid/save.py --test --metadata-file test.txt
