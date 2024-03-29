"""add last_updated to sample_lineages table

Create Date: 2022-12-01 17:45:12.807002

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221201_174505"
down_revision = "20221122_222651"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "sample_lineages",
        sa.Column("last_updated", sa.DateTime(), nullable=True),
        schema="aspen",
    )

    conn = op.get_bind()
    insert_last_updated_sql = sa.sql.text(
        """
        UPDATE aspen.sample_lineages
        SET last_updated = t.pangolin_last_updated FROM (SELECT *
        FROM aspen.uploaded_pathogen_genomes upg
        INNER JOIN aspen.pathogen_genomes pg
        ON pg.entity_id = upg.pathogen_genome_id
        ) t
        WHERE aspen.sample_lineages.sample_id = t.sample_id
    """
    )

    conn.execute(insert_last_updated_sql)


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
