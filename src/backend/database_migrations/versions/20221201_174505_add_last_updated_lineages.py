"""

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
    insert_accessions_sql = sa.sql.text(
        """
        INSERT INTO aspen.sample_lineages (last_updated)
        SELECT pg.pangolin_last_updated
        FROM aspen.uploaded_pathogen_genomes upg
        INNER JOIN aspen.pathogen_genomes pg ON pg.entity_id = upg.pathogen_genome_id
        INNER JOIN aspen.samples s ON s.id = upg.sample_id
        INNER JOIN aspen.pathogens p ON p.id = s.pathogen_id
        WHERE pg.pangolin_lineage IS NOT NULL AND p.slug = 'SC2'
        ON CONFLICT DO NOTHING
        """
    )
    conn.execute(insert_accessions_sql)


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
