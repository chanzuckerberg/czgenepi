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
        INSERT INTO aspen.pathogens (slug, name) VALUES ('HCV', 'Hepatitis C'), ('MPX', 'Monkeypox')
        ON CONFLICT (slug) DO NOTHING
        """
    )  # on conflict do nothing is because in local dev we already have MPX in the database

    op.execute("select nextval('aspen.pathogen_repo_configs_id_seq')")
    op.execute(
        """
        INSERT INTO aspen.pathogen_repo_configs (prefix, public_repository_id, pathogen_id) VALUES
             ( 'hcv', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE slug='HCV') ),
             ( 'hMpxV', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE slug='MPX') )
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
