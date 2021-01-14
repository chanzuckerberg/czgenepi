import click
from covidr.database.connection import get_db_uri, init_db
from covidr.database.schema import create_tables_and_schema
from covidr.sandbox.runtimeenvironment import RuntimeEnvironment

from .toplevel import cli


@cli.group()
@click.pass_context
def db(ctx):
    # TODO: support multiple runtime environments.
    ctx.obj["ENGINE"] = init_db(get_db_uri(RuntimeEnvironment.LOCAL))


@db.command("create")
@click.pass_context
def create_db(ctx):
    create_tables_and_schema(ctx.obj["ENGINE"])
