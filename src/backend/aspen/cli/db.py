import os
import subprocess
from typing import Type

import boto3
import click
from IPython.terminal.embed import InteractiveShellEmbed
from sqlalchemy_utils import create_database, database_exists, drop_database

from aspen.cli.toplevel import cli
from aspen.config.config import Config
from aspen.config.docker_compose import DockerComposeConfig
from aspen.database.connection import enable_profiling, get_db_uri, init_db
from aspen.database.models import *  # noqa: F401, F403
from aspen.database.schema import create_tables_and_schema


@cli.group()
@click.option("--remote", "config_cls", flag_value=Config)
@click.option("--local", "config_cls", flag_value=DockerComposeConfig, default=True)
@click.option("--profile/--no-profile", default=False)
@click.pass_context
def db(ctx, config_cls: Type[Config], profile: bool):
    # TODO: support multiple runtime environments.
    config = config_cls()
    ctx.obj["CONFIG"] = config
    ctx.obj["ENGINE"] = init_db(get_db_uri(config))

    if profile:
        enable_profiling()


@db.command("setup")
@click.option(
    "--load-data",
    type=str,
    default=lambda: os.environ.get("DATA_LOAD_PATH", ""),
    help="S3 URI for data to import",
)
@click.pass_context
def setup(ctx, load_data):
    """If the database we're trying to connect to doesn't exist: create it and load a default dataset into it"""

    conf = ctx.obj["CONFIG"]
    engine = ctx.obj["ENGINE"]
    db_uri = conf.DATABASE_URI
    if database_exists(db_uri):
        print("Database already exists!")
        return

    print("Database does not exist, creating database")
    create_database(db_uri)
    if load_data:
        print(f"Importing {load_data}")
        import_data(load_data, db_uri)
    else:
        print("Creating empty tables")
        create_tables_and_schema(engine)


@db.command("create")
@click.pass_context
def create_db(ctx):
    create_tables_and_schema(ctx.obj["ENGINE"])


@db.command("drop")
@click.pass_context
def drop(ctx):
    conf = ctx.obj["CONFIG"]
    db_uri = conf.DATABASE_URI
    if database_exists(db_uri):
        print("Database exists, dropping database")
        drop_database(db_uri)
    else:
        print("Database does not exist, skipping")
        exit(1)


def import_data(s3_path, db_uri):
    s3 = boto3.resource("s3")
    bucket_name = s3_path.split("/")[0]
    path = "/".join(s3_path.split("/")[1:])
    print(f"downloading {path}")
    s3.Bucket(bucket_name).download_file(path, "db_data.sql")

    with subprocess.Popen(["psql", db_uri], stdin=subprocess.PIPE) as proc:
        proc.stdin.write(open("db_data.sql", "rb").read())
        proc.stdin.close()


@db.command("interact")
@click.option(
    "--connect/--no-connect", default=False, help="Connect to the db immediately"
)
@click.pass_context
def interact(ctx, connect):
    # these are injected into the IPython scope, but they appear to be unused.
    engine = ctx.obj["ENGINE"]  # noqa: F841

    # This forces an immediate connection to our database, which is useful to
    # prevent an ssh tunnel from closing while we're composing queries.
    if connect:
        engine._engine.connect()
        session = engine.make_session()  # noqa: F841

    shell = InteractiveShellEmbed()
    shell()
