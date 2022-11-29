"""

Create Date: 2022-11-29 01:29:55.912119

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221129_012949"
down_revision = "20221101_201105"
branch_labels = None
depends_on = None


def upgrade():
    # Add column
    op.add_column(
        "usher_options",
        sa.Column("pathogen_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_usher_options_pathogen_id_pathogens"),
        "usher_options",
        "pathogens",
        ["pathogen_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )
    op.create_unique_constraint(
        op.f("uq_usher_options_pathogen_id_priority"),
        "usher_options",
        ["pathogen_id", "priority"],
        schema="aspen",
    )

    # Backpopulate existing usher options
    op.execute(
        """
        UPDATE aspen.usher_options
        SET pathogen_id=(
            SELECT id from aspen.pathogens WHERE slug='SC2'
        )
        WHERE pathogen_id IS NULL
        """
    )
    op.alter_column(
        "usher_options",
        "pathogen_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
