"""

Create Date: 2022-10-07 17:07:52.988641

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20221007_170744"
down_revision = "20221004_221741"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "aligned_peptides",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("sample_id", sa.Integer(), nullable=True),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("s3_bucket", sa.String(), nullable=False),
        sa.Column("s3_key", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["entity_id"],
            ["aspen.entities.id"],
            name=op.f("fk_aligned_peptides_entity_id_entities"),
        ),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_aligned_peptides_sample_id_samples"),
        ),
        sa.PrimaryKeyConstraint("entity_id", name=op.f("pk_aligned_peptides")),
        sa.UniqueConstraint(
            "s3_bucket", "s3_key", name="uq_aligned_peptides_s3_bucket_key"
        ),
        schema="aspen",
    )
    op.create_table(
        "sample_mutations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("sample_id", sa.Integer(), nullable=False),
        sa.Column("substitutions", sa.String(), nullable=True),
        sa.Column("insertions", sa.String(), nullable=True),
        sa.Column("deletions", sa.String(), nullable=True),
        sa.Column("aa_substitutions", sa.String(), nullable=True),
        sa.Column("aa_insertions", sa.String(), nullable=True),
        sa.Column("aa_deletions", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_sample_mutations_sample_id_samples"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sample_mutations")),
        schema="aspen",
    )
    op.create_table(
        "aligned_pathogen_genome",
        sa.Column("pathogen_genome_id", sa.Integer(), nullable=False),
        sa.Column("sample_id", sa.Integer(), nullable=False),
        sa.Column(
            "aligned_date",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("reference_name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["pathogen_genome_id"],
            ["aspen.pathogen_genomes.entity_id"],
            name=op.f("fk_aligned_pathogen_genome_pathogen_genome_id_pathogen_genomes"),
        ),
        sa.ForeignKeyConstraint(
            ["sample_id"],
            ["aspen.samples.id"],
            name=op.f("fk_aligned_pathogen_genome_sample_id_samples"),
        ),
        sa.PrimaryKeyConstraint(
            "pathogen_genome_id", name=op.f("pk_aligned_pathogen_genome")
        ),
        sa.UniqueConstraint(
            "sample_id", name=op.f("uq_aligned_pathogen_genome_sample_id")
        ),
        schema="aspen",
    )
    op.drop_constraint(
        "uq_sample_qc_metrics_sample_id",
        "sample_qc_metrics",
        schema="aspen",
        type_="unique",
    )
    op.drop_constraint(
        "fk_sample_qc_metrics_qc_type_qc_types",
        "sample_qc_metrics",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_column("sample_qc_metrics", "qc_type", schema="aspen")
    op.drop_table("qc_types", schema="aspen")

    op.add_column(
        "pathogens",
        sa.Column("nextclade_dataset_name", sa.String(), nullable=True),
        schema="aspen",
    )

    op.enum_insert("entity_types", ["ALIGNED_PATHOGEN_GENOME"], schema="aspen")


def downgrade():
    raise NotImplementedError("Downgrading the DB Not Allowed")