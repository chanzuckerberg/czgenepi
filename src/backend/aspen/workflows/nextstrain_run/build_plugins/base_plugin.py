from typing import Any, Mapping

from aspen.database.models import Group, Pathogen


class BaseConfigPlugin:
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
