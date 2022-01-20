"""Add sample accessions table

Create Date: 2022-01-10 15:31:32.298296

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220119_153132"
down_revision = "20220115_011524"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    op.create_table(
        "accession_types",
        sa.Column("item_id", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("item_id", name=op.f("pk_accession_types")),
        schema="aspen",
    )

    op.enum_insert(
        "accession_types",
        ["GISAID_ISL", "GENBANK"],
        schema="aspen",
    )

    op.create_table(
        "accessions",
        sa.Column("sample_id", sa.Integer(), nullable=False),
        sa.Column("accession_type", enumtables.enum_column.EnumType(), nullable=False),
        sa.Column("accession", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_accessions_sample_id_samples"),
        ),
        sa.ForeignKeyConstraint(
            ["accession_type"],
            ["aspen.accession_types.item_id"],
            name=op.f("fk_accessions_accession_type_accession_types"),
        ),
        sa.UniqueConstraint(
            "sample_id",
            "accession_type",
            name=op.f("uq_accessions_sample_id_accession_type"),
        ),
        schema="aspen",
    )

    insert_accessions_sql = sa.sql.text(
        "WITH subquery AS (SELECT samples.id, gisaid_metadata.gisaid_epi_isl FROM aspen.samples INNER JOIN aspen.gisaid_metadata ON samples.public_identifier = gisaid_metadata.strain) INSERT INTO aspen.accessions SELECT id, 'GISAID_ISL', gisaid_epi_isl FROM subquery ON CONFLICT ON CONSTRAINT uq_accessions_sample_id_accession_type DO UPDATE SET accession = EXCLUDED.accession"
    )
    conn.execute(insert_accessions_sql)


def downgrade():
    pass
