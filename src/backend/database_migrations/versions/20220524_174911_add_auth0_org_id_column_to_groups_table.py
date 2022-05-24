"""Add auth0 org id column to groups table

Create Date: 2022-05-24 17:49:12.876167

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220524_174911"
down_revision = "20220503_215541"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column("auth0_org_id", sa.String(), nullable=True),
        schema="aspen",
    )
    op.execute(sa.sql.text("UPDATE aspen.groups SET auth0_org_id = 'MIGRATION PLACEHOLDER'"))
    op.create_unique_constraint(
        op.f("uq_groups_auth0_org_id"), "groups", ["auth0_org_id"], schema="aspen"
    )
    op.alter_column("groups", "auth0_org_id", nullable=False)


def downgrade():
    pass
