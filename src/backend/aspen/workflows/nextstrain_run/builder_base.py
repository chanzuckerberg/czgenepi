from typing import Any, Mapping

import dateparser
import yaml

from aspen.database.models import Group, Pathogen


class BaseNextstrainConfigBuilder:
    def __init__(
        self,
        template_file: str,
        pathogen: Pathogen,
        group: Group,
        template_args: Mapping[str, Any],
        **kwargs: Mapping[str, Any]
    ):
        self.template_file = template_file
        self.group = group
        self.pathogen = pathogen
        self.template_args = template_args
        self.template = None
        self.tree_build_level = "location"
        # Set self.num_county_sequences, self.num_sequences, etc.
        for k, v in kwargs.items():
            setattr(self, k, v)

    def load_template(self):
        if not self.template:
            with open(self.template_file, "r") as fh:
                self.template = yaml.load(fh, Loader=yaml.FullLoader)
        return self.template

    def update_build(self, config):
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

    def update_subsampling(self, config):
        raise NotImplementedError()

    def write_file(self, destination_fh):
        config = self.load_template()
        self.update_build(config)
        self.update_subsampling(config, config["subsampling"][self.subsampling_scheme])

        # Remove unused subsampling schemes from our output file
        subsampling = config["subsampling"][self.subsampling_scheme]
        config["subsampling"] = {self.subsampling_scheme: subsampling}

        yaml.dump(config, destination_fh)
