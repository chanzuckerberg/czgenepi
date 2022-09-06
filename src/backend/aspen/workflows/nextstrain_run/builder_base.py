from typing import Any, Mapping

import dateparser
import yaml

from aspen.database.models import Group, Pathogen

class TemplateBuilder:
    def __init__(self, tree_type: TreeType, pathogen: Pathogen, group, template_args, **kwargs):
        self.pathogen: Pathogen = pathogen
        self.tree_type: TreeType = tree_type
        self.group: Group = group
        self.template_args = template_args
        self.kwargs = kwargs
        self.template = None
        self.template_file: str = "/usr/src/app/aspen/workflows/nextstrain_run/builds_templates/mega_template.yaml"

        # Update our "build" section
        self.modifiers = [BuildConfigUpdater(pathogen, group, template_args, **kwargs)]
        # Update our template based on the type of tree we're building
        self.modifiers.append(self.get_type_modifier(tree_type, pathogen, group, template_args, kwargs))
        # Update our template based on the pathogen we're working with
        self.modifiers.append(self.get_pathogen_modifier(tree_type, pathogen, group, template_args, kwargs))

    def get_pathogen_modifier(self, tree_type: TreeType, pathogen: Pathogen, group, template_args, **kwargs):
        if pathogen.slug == "SC2":
            return SC2Builder(pathogen, group, template_args, **kwargs)
        if pathogen.slug == "MPX":
            return MPXBuilder(pathogen, group, template_args, **kwargs)
        raise Exception("Unknown build type")

    def get_type_modifier(self, tree_type: TreeType, pathogen: Pathogen, group, template_args, **kwargs):
        # This is basically a router -- We'll switch between which build types
        # based on a variety of input.
        if tree_type == TreeType.TARGETED:
            return TargetedBuilder(pathogen, group, template_args, **kwargs)
        if tree_type == TreeType.OVERVIEW:
            return OverviewBuilder(pathogen, group, template_args, **kwargs)
        if tree_type == TreeType.NON_CONTEXTUALIZED:
            return NonContextualizedBuilder(pathogen, group, template_args, **kwargs)
        raise Exception("Unknown build type")

    def load_template(self):
        if not self.template:
            with open(self.template_file, "r") as fh:
                self.template = yaml.load(fh, Loader=yaml.FullLoader)
        return self.template

    def write_file(self, destination_fh):
        config = self.load_template()
        for modifier in self.modifiers:
            modifier.update_config(config, config["subsampling"][self.subsampling_scheme])

        # Remove unused subsampling schemes from our output file
        subsampling = config["subsampling"][self.subsampling_scheme]
        config["subsampling"] = {self.subsampling_scheme: subsampling}

        yaml.dump(config, destination_fh)


class BaseNextstrainConfigBuilder:
    def __init__(
        self,
        pathogen: Pathogen,
        group: Group,
        template_args: Mapping[str, Any],
        **kwargs: Mapping[str, Any]
    ):
        self.group = group
        self.pathogen = pathogen
        self.template_args = template_args
        self.template = None
        self.tree_build_level = "location"
        # Set self.num_county_sequences, self.num_sequences, etc.
        for k, v in kwargs.items():
            setattr(self, k, v)

    def update_config(self, config):
        raise NotImplementedError()

class BuildConfigUpdater(BaseNextstrainConfigBuilder):
    def update_config(self, config):
        build = config["builds"]["aspen"]

        location = self.group.default_tree_location
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
                del build[field]

        # NOTE: <BuilderClass>.subsampling_scheme is used in 3 places:
        #   - Its lowercase'd name is used to find a markdown file with an "about this tree" description
        #   - It refers to a subsampling_scheme key in the mega nextstrain template
        #   - It's title-case'd and included in the tree title as human-readable text
        build["subsampling_scheme"] = self.subsampling_scheme

        # Update the tree's title with build type, location and date range.
        if (self.template_args.get("filter_start_date") is not None) and (
            self.template_args.get("filter_end_date") is not None
        ):
            title_template = "{tree_type} tree for samples collected in {location} between {start_date} and {end_date}"
            build["title"] = title_template.format(
                tree_type=self.subsampling_scheme.title(),
                location=", ".join(location_values),
                start_date=dateparser.parse(
                    self.template_args.get("filter_start_date")
                ).strftime("%Y-%m-%d"),
                end_date=dateparser.parse(
                    self.template_args.get("filter_end_date")
                ).strftime("%Y-%m-%d"),
            )
        else:
            title_template = "{tree_type} tree for samples collected in {location}"
            build["title"] = title_template.format(
                tree_type=self.subsampling_scheme.title(),
                location=", ".join(location_values),
            )

        config["files"]["description"] = config["files"]["description"].format(
            tree_type=self.subsampling_scheme.lower()
        )
        config["priorities"]["crowding_penalty"] = self.crowding_penalty