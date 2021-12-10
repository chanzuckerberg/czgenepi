from math import ceil

from aspen.database.models import TreeType
from aspen.workflows.nextstrain_run.builder_base import BaseNextstrainConfigBuilder


def builder_factory(tree_type: TreeType, group, template_args, **kwargs):
    # This is basically a router -- We'll switch between which build types
    # based on a variety of input.

    # TODO we probably don't want to specify a literal filename in our workflow run!
    # This is just a bandaid for now until we fix the workflow input side of tree builds.
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
            subsampling["group"]["query"] = "--query \"((location == '{location}') & (division == '{division}')) | submitting_lab == 'RIPHL at Rush University Medical Center'\""


class NonContextualizedBuilder(BaseNextstrainConfigBuilder):
    subsampling_scheme = "NON_CONTEXTUALIZED"
    crowding_penalty = 0.1

    def update_subsampling(self, config, subsampling):
        pass


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
          self.group : information about the group that this run is for (ex: self.group.name or self.group.division)
          config.num_sequences : the number of aspen samples written to our fasta input file
          config.num_included_samples : the number of samples in includes.txt (aspen + gisaid samples) for on-demand runs only

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

        subsampling["group"]["max_sequences"] = other_max_sequences
        subsampling["state"]["max_sequences"] = other_max_sequences
        subsampling["country"]["max_sequences"] = other_max_sequences
        subsampling["international"]["max_sequences"] = other_max_sequences
