#!/bin/sh


# date filters
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --template-args '{"filter_start_date": "3 months ago"}' --location 'North America/Mexico/Michoacan/Morelia' --pathogen MPX --tree-type overview && cp nextstrain_build.yaml build_config_tests/overview_start_filter.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --template-args '{"filter_start_date": "3 months ago", "filter_end_date": "today"}' --location 'North America/Mexico/Michoacan/' --pathogen MPX --tree-type overview && cp nextstrain_build.yaml build_config_tests/overview_start_and_end_filters.yaml

# No samples in non-contextualized
python export_test.py --sequences 0 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/Morelia' --pathogen MPX --tree-type non_contextualized && cp nextstrain_build.yaml build_config_tests/noncontextualized_no_samples.yaml

# lineage filters
python export_test.py --sequences 0 --gisaid 0 --group-name CZI --template-args '{"filter_pango_lineages": ["A.1", "BA.3"]}'  --location 'North America/Mexico/Michoacan/Morelia' --pathogen MPX --tree-type non_contextualized && cp nextstrain_build.yaml build_config_tests/noncontextualized_no_samples.yaml

# Targeted
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/Morelia' --pathogen MPX --tree-type targeted && cp nextstrain_build.yaml build_config_tests/targeted_location.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/' --pathogen MPX --tree-type targeted && cp nextstrain_build.yaml build_config_tests/targeted_division.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico//' --pathogen MPX --tree-type targeted && cp nextstrain_build.yaml build_config_tests/targeted_country.yaml

# Overview
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/Morelia' --pathogen MPX --tree-type overview && cp nextstrain_build.yaml build_config_tests/overview_location.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/' --pathogen MPX --tree-type overview && cp nextstrain_build.yaml build_config_tests/overview_division.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico//' --pathogen MPX --tree-type overview && cp nextstrain_build.yaml build_config_tests/overview_country.yaml

# Non-contextualized
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/Morelia' --pathogen MPX --tree-type non_contextualized && cp nextstrain_build.yaml build_config_tests/noncontextualized_country.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico/Michoacan/' --pathogen MPX --tree-type non_contextualized && cp nextstrain_build.yaml build_config_tests/noncontextualized_country.yaml
python export_test.py --sequences 10 --gisaid 0 --group-name CZI --location 'North America/Mexico//' --pathogen MPX --tree-type non_contextualized && cp nextstrain_build.yaml build_config_tests/noncontextualized_country.yaml
