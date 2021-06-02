"""add uploaded_by to samples

Create Date: 2021-05-26 16:27:48.811543

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210526_162747"
down_revision = "20210524_233229"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "samples",
        sa.Column("uploaded_by_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_samples_uploaded_by_id_users"),
        "samples",
        "users",
        ["uploaded_by_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )

    conn = op.get_bind()

    # create aspen admin user group
    create_group_sql = sa.sql.text(
        "INSERT INTO aspen.groups (name, address) VALUES ('ASPEN ADMIN GROUP', 'stub')"
    )
    conn.execute(create_group_sql)

    # create aspin admin user
    create_user_sql = sa.sql.text(
        "INSERT INTO aspen.users (name, email, auth0_user_id, agreed_to_tos, group_admin, system_admin, group_id) (SELECT 'ASPEN ADMIN', 'aspen_admin@chanzuckerberg.com', 'stub', 't', 't', 't', id from aspen.groups where name='ASPEN ADMIN GROUP');"
    )
    conn.execute(create_user_sql)

    # backfill uploaded_by field to aspen admin
    backfill_sql = sa.sql.text(
        "UPDATE aspen.samples SET uploaded_by_id = aspen.users.id FROM aspen.users WHERE aspen.users.name = 'ASPEN ADMIN'"
    )
    conn.execute(backfill_sql)

    # set field to be non-nullable
    op.alter_column(
        "samples",
        "uploaded_by_id",
        existing_type=sa.Integer,
        nullable=False,
        schema="aspen",
    )


def downgrade():
    op.drop_constraint(
        op.f("fk_samples_uploaded_by_id_users"),
        "samples",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_column("samples", "uploaded_by_id", schema="aspen")
