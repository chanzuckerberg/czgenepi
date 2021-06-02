"""small modifications to samples table

Create Date: 2021-06-02 21:12:45.468074

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210602_211244"
down_revision = "20210526_162747"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "samples",
        "czb_failed_genome_recovery",
        existing_type=sa.BOOLEAN(),
        nullable=True,
        existing_comment="This is set to true iff this is sample sequenced by CZB and failed genome recovery.",
        existing_server_default=sa.text("true"),
        schema="aspen",
    )

    update_organism_sql = sa.sql.text(
        "UPDATE aspen.samples SET organism ='Severe acute respiratory syndrome coronavirus 2'"
    )

    conn = op.get_bind()
    conn.execute(update_organism_sql)


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
