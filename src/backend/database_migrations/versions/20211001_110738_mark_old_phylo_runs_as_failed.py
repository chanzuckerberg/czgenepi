"""Mark old Phylo Runs as failed

Create Date: 2021-10-01 11:07:38.260898

"""
import datetime

import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20211001_110738"
down_revision = "20210928_203749"
branch_labels = None
depends_on = None


def upgrade():
    now = datetime.datetime.now()
    forty_eight_hours = datetime.timedelta(hours=48)
    forty_eight_hours_ago = now - forty_eight_hours

    mark_failed_sql = sa.sql.text(
        "UPDATE aspen.workflows SET workflow_status = 'FAILED', end_datetime = :now WHERE workflow_type = 'PHYLO_RUN' AND workflow_status = 'STARTED' AND start_datetime <= :cutoff"
    )
    params = {"now": now, "cutoff": forty_eight_hours_ago}

    conn = op.get_bind()
    conn.execute(mark_failed_sql, params)


def downgrade():
    pass
