"""Add sample accessions table

Create Date: 2022-01-10 15:31:32.298296

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220119_153132"
down_revision = "20220114_192608"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    op.create_table(
        "accessions",
        sa.Column("sample_id", sa.Integer(), nullable=False),
        sa.Column("gisaid_isl", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("sample_id", name=op.f("pk_accessions_sample_id")),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_accessions_sample_id_samples"),
        ),
        schema="aspen",
    )

    populate_accessions_sql = sa.sql.text(
        "INSERT INTO aspen.accessions (sample_id, gisaid_isl) SELECT id, NULL FROM aspen.samples"
    )
    conn.execute(populate_accessions_sql)

    update_accessions_sql = sa.sql.text(
        "UPDATE aspen.accessions SET gisaid_isl = subquery.gisaid_epi_isl FROM (SELECT samples.id, gisaid_metadata.gisaid_epi_isl FROM aspen.samples INNER JOIN aspen.gisaid_metadata ON samples.public_identifier = gisaid_metadata.strain) AS subquery WHERE accessions.sample_id = subquery.id"
    )
    conn.execute(update_accessions_sql)


def downgrade():
    pass
