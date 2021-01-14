import os
from flask import Flask, send_from_directory, render_template

from covidr.config import DevelopmentConfig

# EB looks for an 'application' callable by default.
application = Flask(__name__, static_folder="static")

if os.environ.get("FLASK_ENV") == "development":
    application.config.from_object(config.DevelopmentConfig())

# Catch all routes. If path is a file, send the file;
# else send index.html. Allows reloading React app from any route.
@application.route("/", defaults={"path": ""})
@application.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(application.static_folder + '/' + path):
        return send_from_directory(application.static_folder, path)
    else:
        return send_from_directory(application.static_folder, 'index.html')
