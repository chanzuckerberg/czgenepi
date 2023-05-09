import re
import dateparser

from aspen.workflows.nextstrain_run.build_plugins.base_plugin import BaseConfigPlugin


class PathogenPlugin(BaseConfigPlugin):
    pass


class SC2Plugin(PathogenPlugin):
    def update_config(self, config):
        # default reference is still Wuhan-Hu-1 
        config["nextclade_dataset"] = "sars-cov-2"

        min_date = self.template_args.get("filter_start_date")
        if min_date:
            min_date = dateparser.parse(min_date)
            if min_date >= dateparser.parse("2022-05-01"):
                # if all the samples in the tree are after May 1 2022, 
                # use the 21L dataset which then will trigger the ncov workflow to 
                # also compute metrics for immune escape and ace2 binding. 
                # N.B. this does not cover the edge case where the user force includes 
                # samples from before this date. Not catastrophic, just means the list 
                # of mutations shown in the tree will be less relevant.
                config["nextclade_dataset"] = "sars-cov-2-21L"
                
                # adds new colorby options to show the immune escape and ace2 binding metrics 
                config['files']['auspice_config'] = "my_profiles/aspen/aspen_auspice_config_v2_immune_escape_ace2.json"   

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
        escaped_config = {}
        for k, v in build_config.items():
            if type(v) == str:
                escaped_config[k] = re.sub("'", "\\'", v)
            else:
                escaped_config[k] = v
        for _, sample in config["subsampling"][subsampling_scheme].items():
            if sample.get("query"):
                sample["query"] = sample["query"].format(**escaped_config)
            if sample.get("max_sequences"):
                sample["subsample-max-sequences"] = sample["max_sequences"]
                del sample["max_sequences"]
        config["subsampling"] = config["subsampling"][subsampling_scheme]
