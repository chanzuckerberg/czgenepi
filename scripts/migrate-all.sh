#!/bin/bash

set -Eeuo pipefail

export AWS_PROFILE=genepi-dev

COUNTY_INFO='{
        "marin": {"external_project_id": "RR089e", "internal_project_ids": ["RR089i"]},
        "contra_costa": {"external_project_id": "RR077e", "internal_project_ids": ["RR077i"]},
        "santa_clara": {"external_project_id": "RR065e", "internal_project_ids": ["RR065i"]},
        "san_joaquin": {"external_project_id": "RR080e", "internal_project_ids": ["RR080i"]},
        "orange": {"external_project_id": "RR074e"},
        "san_bernardino": {"external_project_id": "RR082e"},
        "alameda": {"external_project_id": "RR066e", "internal_project_ids": ["RR066i", "RR086i", "RR087i"]},
        "monterey": {"external_project_id": "RR079e", "internal_project_ids": ["RR079i"]},
        "san_luis_obispo": {"external_project_id": "RR073e", "internal_project_ids": ["RR073i"]},
        "ventura": {"external_project_id": "RR078e"},
        "humboldt": {"external_project_id": "RR075e"},
        "vrdl": {"external_project_id": "RR096e"},
        "tuolumne": {"internal_project_ids": ["RR095i"]},
        "fresno": {"external_project_id": "RR097e"},
        "sfpdh": {"external_project_id": "RR083e"},
        "tulare": {"external_project_id": "RR081e"}
}'
IFS=$'\n' COUNTIES=($(jq -r 'keys[]' <<< "$COUNTY_INFO"))

################################################################################
# import all the DPH users

for county in "${COUNTIES[@]}"; do
    # This builds an array of the external project id, followed by all the internal project ids.  It
    # grabs the first one and imports the users from that project.
    project_id=$(jq -r "([.$county.external_project_id | select(.)] + (.$county.internal_project_ids // []))[0]" <<< "$COUNTY_INFO")
    echo "Importing users for $county from $project_id..."

    # aspen-cli db import-covidhub-users spits out a json structure to stdout.  capture the output.
    import_users_output=$(aspen-cli db --local import-covidhub-users --rr-project-id "$project_id" --covidhub-db-secret cliahub/cliahub_rds_read_prod --covidhub-aws-profile biohub)

    # Inject the group_id back into the COUNTY_INFO data structure.
    COUNTY_INFO=$(jq -r ".$county.aspen_group_id = $(jq -r .group_id <<< "$import_users_output")" <<< "$COUNTY_INFO")
done

for county in "${COUNTIES[@]}"; do
    aspen_group_id=$(jq -r ".$county".aspen_group_id <<< "$COUNTY_INFO")
    if [ "$(jq ".$county | has(\"internal_project_ids\")" <<< "$COUNTY_INFO")" = "true" ]; then
        echo "Importing internal samples for $county..."
        for internal_project_id in $(jq -r ".$county".internal_project_ids[] <<< "$COUNTY_INFO"); do
            aspen-cli db --local import-covidhub-project --rr-project-id "$internal_project_id" --covidhub-db-secret cliahub/cliahub_rds_read_prod  --covidhub-aws-profile biohub --aspen-group-id "$aspen_group_id"
        done
    fi

    if [ "$(jq ".$county | has(\"external_project_id\")" <<< "$COUNTY_INFO")" = "true" ]; then
        echo "Importing external samples for $county..."
        external_project_id=$(jq -r ".$county".external_project_id <<< "$COUNTY_INFO")
        aspen-cli db --local import-covidhub-project --rr-project-id "$external_project_id" --covidhub-db-secret cliahub/cliahub_rds_read_prod  --covidhub-aws-profile biohub --aspen-group-id "$aspen_group_id"
    fi
done

for county in "${COUNTIES[@]}"; do
    aspen_group_id=$(echo "$COUNTY_INFO" | jq -r ".$county".aspen_group_id <<< "$COUNTY_INFO")
    aspen-cli db --local import-covidhub-trees --covidhub-aws-profile biohub --s3-src-prefix s3://covidtracker-datasets/cdph/"$county" --s3-key-prefix /imported/phylo_trees/"$county" --aspen-group-id "$aspen_group_id"
done
