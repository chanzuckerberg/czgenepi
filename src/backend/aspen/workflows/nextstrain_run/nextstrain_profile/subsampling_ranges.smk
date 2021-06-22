import datetime

# Set subsampling max date to today.
today = datetime.date.today()

# Set the earliest date to roughly 4.5 months ago (18 weeks).
early_late_cuotff = today - datetime.timedelta(weeks=18)

for build in config["subsampling"]:
    for scheme in config["subsampling"][build]:
        if "_early" in scheme:
            # remove "--query " from initial build_template.yml query and append new query content
            config["subsampling"][build][scheme]["query"] = "--query \"" + config["subsampling"][build][scheme]["query"][9:-1] + f" & (date_submitted < '{early_late_cuotff.strftime('%Y-%m-%d')}')\""

        if "_late" in scheme:
            config["subsampling"][build][scheme]["query"] = "--query \"" + config["subsampling"][build][scheme]["query"][9:-1] + f" & (date_submitted >= '{early_late_cuotff.strftime('%Y-%m-%d')}')\""
