"""Update nextclade dataset names

Create Date: 2024-08-16 22:38:01.098160

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "20240816_223757"
down_revision = "20230321_232555"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """UPDATE aspen.pathogens
        SET nextclade_dataset_name = 'nextstrain/sars-cov-2/wuhan-hu-1/orfs'
        WHERE slug = 'SC2'
        """
    )
    op.execute(
        """UPDATE aspen.pathogens
        SET nextclade_dataset_name = 'nextstrain/mpox/all-clades'
        WHERE slug = 'MPX'
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
