import re

from aspen.workflows.nextstrain_run.build_plugins.base_plugin import BaseConfigPlugin


class PathogenPlugin(BaseConfigPlugin):
    pass


class SC2Plugin(PathogenPlugin):
    def update_config(self, config):
        pass


class MPXPlugin(PathogenPlugin):
    def update_config(self, config):
        build_config = {}
        try:
            build_config = config["builds"]["aspen"]
            config["subsampling_scheme"] = build_config["subsampling_scheme"]
            del config["builds"]
        except KeyError:
            pass
        subsampling_scheme = config["subsampling_scheme"]
        escaped_config = {k: re.sub("'", "\\'", v) for k, v in build_config.items()}
        print(escaped_config)
        for _, sample in config["subsampling"][subsampling_scheme].items():
            if sample.get("query"):
                sample["query"] = sample["query"].format(**escaped_config)
        config["subsampling"] = config["subsampling"][subsampling_scheme]
