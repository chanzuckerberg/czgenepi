import click
from IPython.terminal.embed import InteractiveShellEmbed

from aspen.config.development import DevelopmentConfig
from aspen.database.connection import get_db_uri, init_db
from aspen.database.models import *  # noqa: F401, F403
from aspen.database.schema import create_tables_and_schema

from .toplevel import cli


@cli.group()
@click.pass_context
def db(ctx):
    # TODO: support multiple runtime environments.
    ctx.obj["ENGINE"] = init_db(get_db_uri(DevelopmentConfig()))


@db.command("create")
@click.pass_context
def create_db(ctx):
    create_tables_and_schema(ctx.obj["ENGINE"])


@db.command("interact")
@click.pass_context
def interact(ctx):
    # these are injected into the IPython scope, but they appear to be unused.
    engine = ctx.obj["ENGINE"]  # noqa: F841

    shell = InteractiveShellEmbed()
    shell()
