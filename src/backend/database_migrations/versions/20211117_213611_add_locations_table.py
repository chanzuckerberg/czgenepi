"""Add Locations Table

Create Date: 2021-11-17 21:36:11.102820

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211117_213611"
down_revision = "20211117_213610"
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("division", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_locations")),
        sa.UniqueConstraint(
            "region", "country", "division", "location", name=op.f("uq_locations_cols")
        ),
        schema="aspen",
    )
    op.add_column(
        "samples",
        sa.Column("location_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_samples_locations"),
        "samples",
        "locations",
        ["location_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )


def downgrade():
    pass
