from flask import (Flask, render_template)

# EB looks for an 'application' callable by default.
application = Flask(__name__)


@application.route("/")
def root():
    # return "Hello world!"
    return render_template("index.html", flask_token="Hello world!")
