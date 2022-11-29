"""Add MPX pathogen and nextclade datasets

Create Date: 2022-11-22 23:10:48.896041

Adds in new pathogen of MPX (Monkeypox).
Also adds in appropriate nextclade_dataset_name for all pathogens so far
(the two, SC2 and MPX). This is the value used to fetch the reference
dataset for running Nextclade tool. If you need to add or update
nextclade_dataset_name values in the future, check with Comp Bio
about what the appropriate value to use is for each pathogen: Nextclade
usually has multiple, different possible datasets per pathogen that focus
on different aspects. Don't just pick the first you see!
"""
import enumtables  # noqa: F401
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221122_231047"
down_revision = "20221122_064351"
branch_labels = None
depends_on = None


def upgrade():
    # Appropriate `nextclade_dataset_name` gotten from Comp Bio team member
    op.execute(
        """UPDATE aspen.pathogens
        SET nextclade_dataset_name = 'sars-cov-2'
        WHERE slug = 'SC2'
        """
    )
    op.execute(
        """INSERT INTO aspen.pathogens (slug, name, nextclade_dataset_name)
        VALUES ('MPX', 'Monkeypox', 'hMPXV')
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
