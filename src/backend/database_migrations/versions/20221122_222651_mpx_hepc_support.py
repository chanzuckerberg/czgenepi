"""

Create Date: 2022-11-22 22:26:58.178142

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221122_222651"
down_revision = "20221101_201105"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        INSERT INTO aspen.pathogens (id, slug, name) VALUES ((SELECT MAX(id)+1 FROM aspen.pathogens), 'HCV', 'Hepatitis C'), ((SELECT MAX(id)+2 FROM aspen.pathogens), 'MPX', 'Monkeypox')
        ON CONFLICT (slug) DO NOTHING
        """
    )  # on conflict do nothing is because in local dev we already have MPX in the database

    op.execute(
        """
        INSERT INTO aspen.pathogen_repo_configs (id, prefix, public_repository_id, pathogen_id) VALUES
             ( (SELECT MAX(id)+1 FROM aspen.pathogen_repo_configs), 'hcv', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE slug='HCV') ),
             ( (SELECT MAX(id)+2 FROM aspen.pathogen_repo_configs), 'hMpxV', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE slug='MPX') )
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
