"""Uniqueness of IDs at group level, not global

Create Date: 2021-10-15 20:59:01.637737

"""
import enumtables  # noqa: F401
from alembic import op

revision = "20211015_205900"
down_revision = "20211008_225815"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "uq_gisaid_accessions_public_identifier",
        "gisaid_accessions",
        schema="aspen",
        type_="unique",
    )
    op.drop_constraint(
        "uq_samples_public_identifier",
        "samples",
        schema="aspen",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_samples_submitting_group_id_public_identifier",
        "samples",
        ["submitting_group_id", "public_identifier"],
        schema="aspen",
    )


def downgrade():
    op.drop_constraint(
        "uq_samples_submitting_group_id_public_identifier",
        "samples",
        schema="aspen",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_samples_public_identifier",
        "samples",
        ["public_identifier"],
        schema="aspen",
    )
    op.create_unique_constraint(
        "uq_gisaid_accessions_public_identifier",
        "gisaid_accessions",
        ["public_identifier"],
        schema="aspen",
    )
