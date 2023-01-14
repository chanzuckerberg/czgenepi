import re
from math import ceil

import dateparser

from aspen.database.models import TreeType
from aspen.workflows.nextstrain_run.build_plugins.base_plugin import BaseConfigPlugin


class TreeTypePlugin(BaseConfigPlugin):
    crowding_penalty: float = 0
    tree_type: TreeType
    subsampling_scheme: str = "NONE"

    def _update_config_params(self, config):
        if not config.get("builds"):
            # TODO, force MPX structure to look more like SC2's
            config["builds"] = {"aspen": {}}
        build = config["builds"]["aspen"]

        location = self.template_args["location"]
        # Make a shortcut to decide whether this is a location vs division vs country level build
        if not location.division:
            self.tree_build_level = "country"
        elif not location.location:
            self.tree_build_level = "division"
        # Fill out country/division/location fields if the group has them,
        # or remove those fields if they don't.
        location_fields = ["country", "division", "location"]
        location_values = []
        for field in location_fields:
            value = getattr(location, field)
            if value:
                build[field] = value
                location_values.append(value)
            else:
                if build.get(field):
                    del build[field]

        # NOTE: <TreeTypePlugin>.subsampling_scheme is used in 3 places:
        #   - Its lowercase'd name is used to find a markdown file with an "about this tree" description
        #   - It refers to a subsampling_scheme key in the mega nextstrain template
        #   - It's title-case'd and included in the tree title as human-readable text
        build["subsampling_scheme"] = self.subsampling_scheme

        # Update the tree's title with build type, location and date range.
        # We always provide some form of end date in the title.
        end_date = self._get_formatted_tree_end_date()
        # We base format of title on whether we have a `filter_start_date`
        if self.template_args.get("filter_start_date") is not None:
            title_template = "{tree_type} tree for samples collected in {location} between {start_date} and {end_date}"
            build["title"] = title_template.format(
                tree_type=self.subsampling_scheme.title(),
                location=", ".join(location_values),
                start_date=dateparser.parse(
                    self.template_args.get("filter_start_date")
                ).strftime("%Y-%m-%d"),
                end_date=end_date,
            )
        else:
            title_template = "{tree_type} tree for samples collected in {location} up until {end_date}"
            build["title"] = title_template.format(
                tree_type=self.subsampling_scheme.title(),
                location=", ".join(location_values),
                end_date=end_date,
            )

        if config.get("files"):
            config["files"]["description"] = config["files"]["description"].format(
                tree_type=self.subsampling_scheme.lower()
            )
        if config.get("priorities"):
            config["priorities"]["crowding_penalty"] = self.crowding_penalty

    def _get_formatted_tree_end_date(self):
        """Returns appropriate YYYY-MM-DD for tree's end date or "--" if none.

        For tree titles, we want to always have an end date to display. If
        the tree had a `filter_end_date` arg, we can use that. However, if no
        filter arg was given for the end date, we use the implicit end date of
        when the tree build was kicked off (from PhyloRun.start_datetime), as
        the tree build process can only use samples up to the moment in time
        when it was kicked off, so it's an implicit end date to samples.

        If there is no date available at all, we return "--" as an absolute
        fall back. PhyloRun.start_datetime is not actually guaranteed at the DB
        level, but all our code that creates runs always provides one (as of
        Nov 2022, every single run has a start_datetime). The fall back is
        provided just to code defensively in case something weird ever happens.
        """
        formatted_end_date = "--"  # safe default, should never happen
        filter_end_date = self.template_args.get("filter_end_date")
        if filter_end_date is not None:
            formatted_end_date = dateparser.parse(filter_end_date).strftime("%Y-%m-%d")
        else:
            # `run_start_datetime` is a `context` kwarg, so not guaranteed
            run_start_datetime = getattr(self, "run_start_datetime", None)
            if run_start_datetime is not None:
                formatted_end_date = run_start_datetime.strftime("%Y-%m-%d")
            else:
                print("WARNING -- Run missing a start_datetime. Default to '--'")
        return formatted_end_date

    def update_config(self, config):
        self._update_config_params(config)

        subsampling = config["subsampling"][self.subsampling_scheme]
        self.run_type_config(config, subsampling)

        # Remove unused subsampling schemes from our output file
        config["subsampling"] = {self.subsampling_scheme: subsampling}

    def run_type_config(self, config, subsampling):
        raise NotImplementedError("base class doesn't implement this")


class OverviewPlugin(TreeTypePlugin):
    crowding_penalty = 0.1
    tree_type = TreeType.OVERVIEW
    subsampling_scheme = "OVERVIEW"

    def run_type_config(self, config, subsampling):
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

        # If there aren't any selected samples
        # Either due to being a scheduled run or no user selection
        # Put reference sequences in include.txt so tree run don't break
        if self.num_included_samples == 0:
            if config.get("files", {}).get("include"):
                del config["files"]["include"]


class NonContextualizedPlugin(TreeTypePlugin):
    crowding_penalty = 0.1
    tree_type = TreeType.NON_CONTEXTUALIZED
    subsampling_scheme = "NON_CONTEXTUALIZED"

    def run_type_config(self, config, subsampling):
        # Handle sampling date & pango lineage filters
        apply_filters(config, subsampling, self.template_args)

        # Update our sampling for state/country level builds if necessary
        update_subsampling_for_location(self.tree_build_level, subsampling)

        # If there aren't any selected samples due to no user selection
        # Put reference sequences in include.txt so tree run don't break
        if self.num_included_samples == 0:
            if config.get("files", {}).get("include"):
                del config["files"]["include"]


# Set max_sequences for targeted builds.
class TargetedPlugin(TreeTypePlugin):
    crowding_penalty = 0
    tree_type = TreeType.TARGETED
    subsampling_scheme = "TARGETED"

    def run_type_config(self, config, subsampling):
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
        # Nextstrain is rather particular about the acceptable syntax for
        # values in the pango_lineages key. Before modifying please see
        # https://discussion.nextstrain.org/t/failure-when-specifying-multiple-pango-lineages-in-a-build/670
        clean_values = [re.sub(r"[^0-9a-zA-Z.]", "", item) for item in pango_lineages]
        config["builds"]["aspen"]["pango_lineage"] = clean_values
        # Remove the last " from our old query so we can inject more filters
        old_query = subsampling["group"]["query"][:-1]
        pango_query = " & (pango_lineage in {pango_lineage})"
        subsampling["group"]["query"] = old_query + pango_query + '"'
