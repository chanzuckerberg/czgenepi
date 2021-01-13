from flask import Flask

# EB looks for an 'application' callable by default.
application = Flask(__name__)


@application.route("/")
def root():
    return "Hello world!"
