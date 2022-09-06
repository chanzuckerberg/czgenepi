import re
from math import ceil

import dateparser
from typing import Mapping, Any

from aspen.database.models import TreeType, Pathogen, Group
from aspen.workflows.nextstrain_run.build_plugins.base_plugin import BaseConfigPlugin


class PathogenPlugin(BaseConfigPlugin):
    pass


class SC2Plugin(PathogenPlugin):
    def update_config(self, config):
        pass


class MPXPlugin(PathogenPlugin):
    def update_config(self, config):
        pass