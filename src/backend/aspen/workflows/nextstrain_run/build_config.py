import datetime
from math import ceil

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

        # If we passed in a different time window, use it. Default to 12
        cutoff_weeks = self.template_args.get("group_sampling_weeks", 12)

        # only keep group samples within the past 3 months
        today = datetime.date.today()
        early_late_cutoff = today - datetime.timedelta(weeks=cutoff_weeks)

        subsampling["group"][
            "min_date"
        ] = f"--min-date {early_late_cutoff.strftime('%Y-%m-%d')}"

        # Update our sampling for state/country level builds if necessary
        update_subsampling_for_location(self.tree_build_level, subsampling)

        # Update country and international max sequences.
        if self.tree_build_level == "country":
            subsampling["international"]["max_sequences"] = 1000
        if self.tree_build_level == "division":
            subsampling["country"]["max_sequences"] = 800
            subsampling["international"]["max_sequences"] = 200

        # If there aren't any selected samples this is probably a scheduled run
        # and we should, use the reference sequences
        if config.num_included_samples == 0:
            del config["files"]["include"]


class NonContextualizedBuilder(BaseNextstrainConfigBuilder):
    subsampling_scheme = "NON_CONTEXTUALIZED"
    crowding_penalty = 0.1

    def update_subsampling(self, config, subsampling):
        # Update our sampling for state/country level builds if necessary
        update_subsampling_for_location(self.tree_build_level, subsampling)


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
          config.num_sequences : the number of aspen samples written to our fasta input file
          config.num_included_samples : the number of samples in include.txt (aspen + gisaid samples) for on-demand runs only

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
