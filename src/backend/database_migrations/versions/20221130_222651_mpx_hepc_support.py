"""add MPX and HCV DB support for gisaid/genbank template


Create Date: 2022-11-30 22:26:58.178142

"""
import enumtables  # noqa: F401
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221122_222651"
down_revision = "20221129_012949"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        INSERT INTO aspen.pathogens (slug, name) VALUES ('HCV', 'Hepatitis C')
        """
    )

    op.execute(
        """
        SELECT setval('aspen.pathogen_repo_configs_id_seq', (SELECT MAX(id) FROM aspen.pathogen_repo_configs)+1);
        """
    )

    op.execute(
        """
        INSERT INTO aspen.pathogen_repo_configs (prefix, public_repository_id, pathogen_id) VALUES
             ( 'hcv', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE slug='HCV') ),
             ( 'MPXV', (SELECT id from aspen.public_repositories WHERE name='GenBank'), (SELECT id from aspen.pathogens WHERE slug='MPX') )
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
