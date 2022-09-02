"""bump pathogen sequence

Create Date: 2022-09-02 00:17:01.319857

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220902_001655"
down_revision = "20220831_150533"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("select nextval('aspen.pathogens_id_seq')")


def downgrade():
    raise NotImplementedError("Don't downgrade")
