"""delete samples with failed genome recovery

Create Date: 2023-01-09 22:32:19.877984

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20230109_223207"
down_revision = "20221201_174505"
branch_labels = None
depends_on = None


def upgrade():

    conn = op.get_bind()
    for table in [
        "uploaded_pathogen_genomes",
        "sample_lineages",
        "sample_qc_metrics",
        "sample_mutations",
        "accessions",
    ]:
        delete_from_table_sql = f"""
        DELETE FROM aspen.{table} WHERE sample_id IN (SELECT id FROM aspen.samples where czb_failed_genome_recovery = true)
        """
        conn.execute(delete_from_table_sql)

    delete_samples_w_failed_genome_sql = sa.sql.text(
        """
    DELETE FROM aspen.samples where czb_failed_genome_recovery = true
    """
    )
    conn.execute(delete_samples_w_failed_genome_sql)


def downgrade():
    raise NotImplementedError("Downgrading the database is not allowed")
