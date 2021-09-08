from typing import Any, Mapping

import yaml

from aspen.database.models import Group


class BaseNextstrainConfigBuilder:
    def __init__(
        self,
        template_file: str,
        group: Group,
        template_args: Mapping[str, Any],
        **kwargs: Mapping[str, Any]
    ):
        self.template_file = template_file
        self.group = group
        self.template_args = template_args
        self.template = None
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
        # TODO - We'll add region/country info to groups soon, but it's not there yet.
        # region = self.group.region
        # country = self.group.country
        # build["region"] = region
        # build["title"] = build["title"].format(division=division, location=location, country=country, region=region)
        country = "USA"
        division = self.group.division
        location = self.group.location
        build["country"] = country
        build["division"] = division
        build["location"] = location

        # NOTE: <BuilderClass>.subsampling_scheme is used in 3 places:
        #   - Its lowercase'd name is used to find a markdown file with an "about this tree" description
        #   - It refers to a subsampling_scheme key in the mega nextstrain template
        #   - It's title-case'd and included in the tree title as human-readable text
        build["subsampling_scheme"] = self.subsampling_scheme
        build["title"] = build["title"].format(
            tree_type=self.subsampling_scheme.title(),
            division=division,
            location=location,
            country=country,
        )
        config["files"]["description"] = config["files"]["description"].format(
            tree_type=self.subsampling_scheme.lower()
        )
        config["crowding"]["crowding_penalty"] = self.crowding_penalty

    def update_subsampling(self, config):
        raise NotImplementedError()

    def write_file(self, destination_fh):
        config = self.load_template()
        self.update_build(config)
        self.update_subsampling(config, config["subsampling"][self.subsampling_scheme])

        # Remote unused subsampling schemes from our output file
        subsampling = config["subsampling"][self.subsampling_scheme]
        config["subsampling"] = {self.subsampling_scheme: subsampling}

        yaml.dump(config, destination_fh)
