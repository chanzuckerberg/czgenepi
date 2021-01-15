import os

from covidr.config import DevelopmentConfig
from flask import Flask, send_from_directory

dir_path = os.path.dirname(os.path.realpath(__file__))

# EB looks for an 'application' callable by default.
application = Flask(__name__, static_folder=f"{dir_path}/static")


if os.environ.get("FLASK_ENV") == "development":
    application.config.from_object(DevelopmentConfig())


# Catch all routes. If path is a file, send the file;
# else send index.html. Allows reloading React app from any route.
@application.route("/", defaults={"path": ""})
@application.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(application.static_folder + "/" + path):
        return send_from_directory(application.static_folder, path)
    else:
        return send_from_directory(application.static_folder, "index.html")
