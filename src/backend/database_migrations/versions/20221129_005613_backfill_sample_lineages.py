"""backfill-sample-lineages

Create Date: 2022-11-29 00:56:21.597181

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221129_005613"
down_revision = "20221128_220950"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    insert_accessions_sql = sa.sql.text(
        """
        INSERT INTO aspen.sample_lineages (sample_id, lineage_type, lineage, lineage_probability, lineage_software_version, raw_lineage_output)
        SELECT s.id, 'PANGOLIN', pg.pangolin_lineage, pg.pangolin_probability, pg.pangolin_version, pg.pangolin_output
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
    raise NotImplementedError("don't downgrade")
