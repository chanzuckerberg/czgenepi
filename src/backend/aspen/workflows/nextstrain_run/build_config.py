import yaml

from aspen.database.models import Group, Pathogen
from aspen.workflows.nextstrain_run.build_plugins.pathogen_plugins import (
    MPXPlugin,
    SC2Plugin,
)
from aspen.workflows.nextstrain_run.build_plugins.type_plugins import (
    NonContextualizedPlugin,
    OverviewPlugin,
    TargetedPlugin,
    TreeType,
)


class TemplateBuilder:
    """A very simplified plugin manager that manages template modifiers for each tree type and pathogen."""

    def __init__(
        self, tree_type: TreeType, pathogen: Pathogen, group, template_args, **kwargs
    ):
        self.pathogen: Pathogen = pathogen
        self.tree_type: TreeType = tree_type
        self.group: Group = group
        self.template_args = template_args
        self.kwargs = kwargs
        self.template = None
        self.template_file: str = f"/usr/src/app/aspen/workflows/nextstrain_run/builds_templates/{pathogen.slug}_template.yaml"

        # Update our "build" section
        self.plugins = []
        # Update our template based on the type of tree we're building
        self.plugins.append(
            self.get_type_plugin(tree_type, pathogen, group, template_args, **kwargs)
        )
        # Update our template based on the pathogen we're working with
        self.plugins.append(
            self.get_pathogen_plugin(
                tree_type, pathogen, group, template_args, **kwargs
            )
        )

    def get_pathogen_plugin(
        self, tree_type: TreeType, pathogen: Pathogen, group, template_args, **kwargs
    ):
        if pathogen.slug == "SC2":
            return SC2Plugin(pathogen, group, template_args, **kwargs)
        if pathogen.slug == "MPX":
            return MPXPlugin(pathogen, group, template_args, **kwargs)
        raise Exception("Unknown pathogen")

    def get_type_plugin(
        self, tree_type: TreeType, pathogen: Pathogen, group, template_args, **kwargs
    ):
        # This is basically a router -- We'll switch between which build types
        # based on a variety of input.
        if tree_type == TreeType.TARGETED:
            return TargetedPlugin(pathogen, group, template_args, **kwargs)
        if tree_type == TreeType.OVERVIEW:
            return OverviewPlugin(pathogen, group, template_args, **kwargs)
        if tree_type == TreeType.NON_CONTEXTUALIZED:
            return NonContextualizedPlugin(pathogen, group, template_args, **kwargs)
        raise Exception("Unknown build type")

    def load_template(self):
        if not self.template:
            with open(self.template_file, "r") as fh:
                self.template = yaml.load(fh, Loader=yaml.FullLoader)
        return self.template

    def write_file(self, destination_fh):
        config = self.load_template()
        for plugin in self.plugins:
            plugin.update_config(config)

        yaml.dump(config, destination_fh)
