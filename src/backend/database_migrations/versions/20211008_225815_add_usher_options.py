"""Add UShER options

Create Date: 2021-10-08 22:58:16.389306

"""
import sqlalchemy as sa
from alembic import op

revision = "20211008_225815"
down_revision = "20211001_110738"
branch_labels = None
depends_on = None


# Options we have as of creation of this migration
CURRENT_USHER_OPTIONS = [
    {
        "description": "High-coverage samples from GISAID, GenBank, COG-UK and CNCB",
        "value": "hgPhyloPlaceData/wuhCor1/public.plusGisaid.latest.masked.pb",
        "priority": 1,
    },
    {
        "description": "High-coverage samples from GenBank, COG-UK and CNCB",
        "value": "hgPhyloPlaceData/wuhCor1/public-latest.all.masked.pb",
        "priority": 2,
    },
]


def upgrade():
    usher_options_table = op.create_table(
        "usher_options",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("value", sa.String(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_usher_options")),
        sa.UniqueConstraint("description", name=op.f("uq_usher_options_description")),
        sa.UniqueConstraint("priority", name=op.f("uq_usher_options_priority")),
        sa.UniqueConstraint("value", name=op.f("uq_usher_options_value")),
        schema="aspen",
    )

    op.bulk_insert(usher_options_table, CURRENT_USHER_OPTIONS)


def downgrade():
    op.drop_table("usher_options", schema="aspen")
