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
        "vrdl": {"external_project_id": "RR096e", "skip_tree_import": true},
        "tuolumne": {"internal_project_ids": ["RR095i"]},
        "fresno": {"external_project_id": "RR097e"},
        "sfpdh": {"external_project_id": "RR083e"},
        "tulare": {"external_project_id": "RR081e"}
}'
IFS=$'\n' COUNTIES=($(echo "$COUNTY_INFO" | jq -r 'keys[]'))

################################################################################
# import all the DPH users

for county in "${COUNTIES[@]}"; do
    for project_id in $(echo "$COUNTY_INFO" | jq -r "([.$county.external_project_id | select(.)] + (.$county.internal_project_ids // []))[]"); do
        echo "Importing users for $county from $project_id..."
        import_users_output=$(aspen-cli db --local import-covidhub-users --rr-project-id "$project_id" --covidhub-db-secret cliahub/cliahub_rds_read_prod  --covidhub-aws-profile biohub)
        COUNTY_INFO=$(echo "$COUNTY_INFO" | jq -r ".$county.aspen_group_id = $(echo "$import_users_output" | jq -r .group_id)")
        break
    done
done

for county in "${COUNTIES[@]}"; do
    aspen_group_id=$(echo "$COUNTY_INFO" | jq -r ".$county".aspen_group_id)
    if [ "$(echo "$COUNTY_INFO" | jq ".$county | has(\"internal_project_ids\")")" = "true" ]; then
        echo "Importing internal samples for $county..."
        for internal_project_id in $(echo "$COUNTY_INFO" | jq -r ".$county".internal_project_ids[]); do
            aspen-cli db --local import-covidhub-project --rr-project-id "$internal_project_id" --covidhub-db-secret cliahub/cliahub_rds_read_prod  --covidhub-aws-profile biohub --aspen-group-id "$aspen_group_id"
        done
    fi

    if [ "$(echo "$COUNTY_INFO" | jq ".$county | has(\"external_project_id\")")" = "true" ]; then
        echo "Importing external samples for $county..."
        external_project_id=$(echo "$COUNTY_INFO" | jq -r ".$county".external_project_id)
        aspen-cli db --local import-covidhub-project --rr-project-id "$external_project_id" --covidhub-db-secret cliahub/cliahub_rds_read_prod  --covidhub-aws-profile biohub --aspen-group-id "$aspen_group_id"
    fi
done

for county in "${COUNTIES[@]}"; do
    if [ "$(echo "$COUNTY_INFO" | jq ".$county.skip_tree_import")" != "true" ]; then
        aspen_group_id=$(echo "$COUNTY_INFO" | jq -r ".$county".aspen_group_id)
        aspen-cli db --local import-covidhub-trees --covidhub-aws-profile biohub --s3-src-prefix s3://covidtracker-datasets/cdph/"$county" --s3-key-prefix /imported/phylo_trees/"$county" --aspen-group-id "$aspen_group_id"
    fi
done
