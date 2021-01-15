import os

from covidr.config import DevelopmentConfig
from flask import Flask

# EB looks for an 'application' callable by default.
application = Flask(__name__, static_folder="static")


if os.environ.get("FLASK_ENV") == "development":
    application.config.from_object(DevelopmentConfig())


# Catch all routes. If path is a file, send the file;
# else send index.html. Allows reloading React app from any route.
@application.route("/")
def root():
    return "Hello world"
