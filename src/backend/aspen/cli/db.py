import datetime
import io
import json
import os
import subprocess
from typing import Iterable, Sequence, Type

import boto3
import click
from IPython.terminal.embed import InteractiveShellEmbed
from sqlalchemy import and_
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import joinedload
from sqlalchemy_utils import create_database, database_exists, drop_database

from aspen.cli.toplevel import cli
from aspen.config.config import Config
from aspen.config.docker_compose import DockerComposeConfig
from aspen.database.connection import (
    enable_profiling,
    get_db_uri,
    init_db,
    session_scope,
)
from aspen.database.models import *  # noqa: F401, F403
from aspen.database.models import (
    AlignedGisaidDump,
    CanSee,
    DataType,
    Group,
    PhyloRun,
    Sample,
    TreeType,
    UploadedPathogenGenome,
    User,
    Workflow,
    WorkflowStatusType,
)
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


@db.command("create-phylo-run")
@click.option(
    "--tree-name",
    type=str,
    required=False,
    help="Name of tree being created",
)
@click.option(
    "--user",
    type=str,
    required=False,
    help="Email address of the user to associate with the build",
)
@click.option(
    "--group-name",
    type=str,
    required=True,
    help="Name of the group to create the phylo run under.",
)
@click.option(
    "--builds-template-args",
    type=str,
    required=True,
    help=(
        "This should be a json dictionary that is used to generate the builds file,"
        " using string interpolation."
    ),
)
@click.option(
    "--git-refspec",
    type=str,
    required=True,
    default="trunk",
    help="The git refspec used to launch the workflow.",
)
@click.option(
    "--tree-type",
    "tree_type",
    required=True,
    type=click.Choice(
        ["OVERVIEW", "TARGETED", "NON_CONTEXTUALIZED"], case_sensitive=False
    ),
    help="The type of phylo tree to create.",
)
@click.pass_context
def create_phylo_run(
    ctx,
    tree_name: str,
    user: str,
    group_name: str,
    builds_template_args: str,
    git_refspec: str,
    tree_type: str,
):
    # these are injected into the IPython scope, but they appear to be unused.
    engine = ctx.obj["ENGINE"]

    with session_scope(engine) as session:
        group = session.query(Group).filter(Group.name == group_name).one()

        aligned_gisaid_dump = (
            session.query(AlignedGisaidDump)
            .join(AlignedGisaidDump.producing_workflow)
            .order_by(Workflow.end_datetime.desc())
            .first()
        )

        workflow: PhyloRun = PhyloRun(
            start_datetime=datetime.datetime.now(),
            workflow_status=WorkflowStatusType.STARTED,
            software_versions={},
            group=group,
            tree_type=TreeType(tree_type),
        )
        workflow.inputs = [aligned_gisaid_dump]
        workflow.template_args = json.loads(builds_template_args)
        if tree_name:
            workflow.name = tree_name
        if user:
            workflow.user = session.query(User).filter(User.email == user).one()

        session.add(workflow)
        session.flush()
        workflow_id = workflow.workflow_id
    print(workflow_id)