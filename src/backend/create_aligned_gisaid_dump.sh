cd aspen/workflows
pushd ingest_gisaid
ingest_id=$(python save.py --aspen-workflow-rev 1234 --aspen-creation-rev 1234 --start-time 1627430379 --end-time 1627430380 --gisaid-s3-bucket gisaid_bucket --gisaid-s3-key some/key)
popd
pushd transform_gisaid
transform_id=$(python save.py --aspen-workflow-rev 1234 --aspen-creation-rev 1234 --start-time 1627430379 --end-time 1627430380 --gisaid-s3-bucket gisaid_bucket --ncov-ingest-rev 1234 --raw-gisaid-object-id 1234 --gisaid-sequences-s3-key sequences_key --gisaid-metadata-s3-key metadata_key --raw-gisaid-object-id $ingest_id)
popd
pushd align_gisaid
align_id=$(python save.py  --aspen-workflow-rev 1234 --aspen-creation-rev 1234 --start-time 1627430379 --end-time 1627430380 --gisaid-s3-bucket gisaid_bucket --ncov-rev 1234 --aspen-docker-image-version "externally managed" --gisaid-sequences-s3-key sequences_key --gisaid-metadata-s3-key metadata_key --processed-gisaid-object-id $transform_id)