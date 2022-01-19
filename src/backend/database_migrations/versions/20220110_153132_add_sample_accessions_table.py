"""Add sample accessions table

Create Date: 2022-01-10 15:31:32.298296

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220110_153132"
down_revision = "20220103_132500"
branch_labels = None
depends_on = None


def upgrade():
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


def downgrade():
    pass
