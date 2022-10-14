"""

Create Date: 2022-10-10 20:15:26.014216

"""
import enumtables  # noqa: F401
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221010_201517"
down_revision = "20221007_170744"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "fk_aligned_peptides_entity_id_entities",
        "aligned_peptides",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_column("aligned_peptides", "entity_id", schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrading the DB is not Allowed")
