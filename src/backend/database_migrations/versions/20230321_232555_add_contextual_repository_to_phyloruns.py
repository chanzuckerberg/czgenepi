"""add contextual repository to phylotrees

Create Date: 2023-03-21 23:26:01.718030

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20230321_232555"
down_revision = "20230321_223941"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "phylo_runs",
        sa.Column("contextual_repository_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_phylo_runs_contextual_repository_id_public_repositories"),
        "phylo_runs",
        "public_repositories",
        ["contextual_repository_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )

    op.execute(
        """
        UPDATE aspen.phylo_runs SET contextual_repository_id = (SELECT id FROM aspen.public_repositories WHERE name = 'GISAID') WHERE pathogen_id = (SELECT id FROM aspen.pathogens WHERE slug = 'SC2')
        """
    )
    op.execute(
        """
        UPDATE aspen.phylo_runs SET contextual_repository_id = (SELECT id FROM aspen.public_repositories WHERE name = 'GenBank') WHERE pathogen_id = (SELECT id FROM aspen.pathogens WHERE slug = 'MPX')
        """
    )
    op.alter_column(
        "phylo_runs",
        "contextual_repository_id",
        existing_type=sa.INTEGER(),
        nullable=False,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
