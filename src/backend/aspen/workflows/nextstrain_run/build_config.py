import json
import re
from math import ceil

import dateparser

from aspen.database.models import TreeType
from aspen.workflows.nextstrain_run.builder_base import BaseNextstrainConfigBuilder


def builder_factory(tree_type: TreeType, group, template_args, **kwargs):
    # This is basically a router -- We'll switch between which build types
    # based on a variety of input.
    mega_template = "/usr/src/app/aspen/workflows/nextstrain_run/builds_templates/mega_template.yaml"

    if tree_type == TreeType.TARGETED:
        return TargetedBuilder(mega_template, group, template_args, **kwargs)
    if tree_type == TreeType.OVERVIEW:
        return OverviewBuilder(mega_template, group, template_args, **kwargs)
    if tree_type == TreeType.NON_CONTEXTUALIZED:
        return NonContextualizedBuilder(mega_template, group, template_args, **kwargs)
    raise Exception("Unknown build type")


class OverviewBuilder(BaseNextstrainConfigBuilder):
    subsampling_scheme = "OVERVIEW"
    crowding_penalty = 0.1

    def update_subsampling(self, config, subsampling):
        if self.group.name == "Chicago Department of Public Health":
            subsampling["group"][
                "query"
            ] = '''--query "((location == '{location}') & (division == '{division}')) | submitting_lab == 'RIPHL at Rush University Medical Center'"'''

        # Handle sampling date & pango lineage filters
        apply_filters(config, subsampling, self.template_args)

        # Update our sampling for state/country level builds if necessary
        update_subsampling_for_location(self.tree_build_level, subsampling)

        # Update country and international max sequences.
        if self.tree_build_level == "country":
            subsampling["international"]["max_sequences"] = 1000
        if self.tree_build_level == "division":
            subsampling["country"]["max_sequences"] = 800
            subsampling["international"]["max_sequences"] = 200

        # If there aren't any selected samples, either a scheduled run or no user selection
        # Put reference sequences in include.txt so tree run don't break
        if self.num_included_samples == 0:
            del config["files"]["include"]


class NonContextualizedBuilder(BaseNextstrainConfigBuilder):
    subsampling_scheme = "NON_CONTEXTUALIZED"
    crowding_penalty = 0.1

    def update_subsampling(self, config, subsampling):
        # Handle sampling date & pango lineage filters
        apply_filters(config, subsampling, self.template_args)

        # Update our sampling for state/country level builds if necessary
        update_subsampling_for_location(self.tree_build_level, subsampling)

        # If there aren't any selected samples due to no user selection
        # Put reference sequences in include.txt so tree run don't break
        if self.num_included_samples == 0:
            del config["files"]["include"]

            
# Set max_sequences for targeted builds.
class TargetedBuilder(BaseNextstrainConfigBuilder):
    subsampling_scheme = "TARGETED"
    crowding_penalty = 0

    def update_subsampling(self, config, subsampling):
        """
        DATA we can use in this function:
          config : the entire mega-template data structure, with some fields already updated by BaseNextstrainConfigBuilder.update_build()
          subsampling : the subsampling scheme for *this build type only* (ex: mega_template["subsampling"]["TARGETED"])
          self.subsampling_scheme : the value a few lines above
          self.crowding_penalty : the value a few lines above
          self.group : information about the group that this run is for (ex: self.group.name or self.group.default_tree_location)
          self.num_sequences : the number of aspen samples written to our fasta input file
          self.num_included_samples : the number of samples in include.txt (aspen + gisaid samples) for on-demand runs only

        EXAMPLES SECTION:
          Delete a group from a subsampling scheme:
              del subsampling["international"]

          Delete a setting from a group:
              del subsampling["international"]["seq_per_group"]

          Add a group to a subsampling scheme:
              subsampling["my_new_group_name"] = {
                  "group_by": "region",
                  "max_sequences": 200,
                  "query": '--query "(foo != {bar})"'
              }

          Add a setting to a group (this is the same as updating an existing setting!):
              subsampling["international"]["mynewsetting"] = "mynewvalue"
        """
        # Adjust group sizes if we have a lot of samples.
        closest_max_sequences = 100
        other_max_sequences = 25
        if self.num_included_samples >= 100:
            closest_max_sequences = self.num_included_samples
            other_max_sequences = int(ceil(self.num_included_samples / 4.0))

        subsampling["closest"]["max_sequences"] = closest_max_sequences

        subsampling["group"]["max_sequences"] = (
            other_max_sequences * 2
        )  # Temp mitigation for missing on-demand overview
        subsampling["state"]["max_sequences"] = (
            other_max_sequences * 2
        )  # Temp mitigation for missing on-demand overview
        subsampling["country"]["max_sequences"] = other_max_sequences
        subsampling["international"]["max_sequences"] = other_max_sequences

        # Update our sampling for state/country level builds if necessary
        update_subsampling_for_location(self.tree_build_level, subsampling)

        # Increase int'l sequences for state/country builds.
        if (
            self.tree_build_level != "location"
            and subsampling["international"]["max_sequences"] < 100
        ):
            subsampling["international"]["max_sequences"] = 100


def update_subsampling_for_location(tree_build_level, subsampling):
    if tree_build_level == "country":
        update_subsampling_for_country(subsampling)
    if tree_build_level == "division":
        update_subsampling_for_division(subsampling)


def update_subsampling_for_country(subsampling):
    # State and country aren't useful
    if "state" in subsampling:
        del subsampling["state"]
    if "country" in subsampling:
        del subsampling["country"]
    # Update our local group query
    subsampling["group"]["query"] = '''--query "(country == '{country}')"'''


def update_subsampling_for_division(subsampling):
    # State isn't useful
    if "state" in subsampling:
        del subsampling["state"]
    # Update our local group query
    subsampling["group"][
        "query"
    ] = '''--query "(division == '{division}') & (country == '{country}')"'''  # Keep the country filter in case of multiple divisions worldwide


def apply_filters(config, subsampling, template_args):
    filter_map = {"filter_start_date": "min_date", "filter_end_date": "max_date"}
    for filter_name, yaml_key in filter_map.items():
        value = template_args.get(filter_name)
        if not value:
            continue  # This filter isn't set, skip it.
        # Support date expressions like "5 days ago" in our cron schedule.
        value = dateparser.parse(value).strftime("%Y-%m-%d")
        subsampling["group"][
            yaml_key
        ] = f"--{yaml_key.replace('_', '-')} {value}"  # ex: --max-date 2020-01-01

    pango_lineages = template_args.get("filter_pango_lineages")
    if pango_lineages:
        # Techically pango_lineages should be a *python* encoded list, but we're
        # cheating since json is interoperable as long as we remove bad characters
        clean_values = [re.sub(r"[^0-9a-zA-Z.]", "", item) for item in pango_lineages]
        config["builds"]["aspen"]["pango_lineage"] = json.dumps(clean_values)
        # Remove the last " from our old query so we can inject more filters
        old_query = subsampling["group"]["query"][:-1]
        pango_query = " & (pango_lineage in {pango_lineage})"
        subsampling["group"]["query"] = old_query + pango_query + '"'
