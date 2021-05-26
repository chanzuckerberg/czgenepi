"""add uploaded_by to samples

Create Date: 2021-05-26 16:27:48.811543

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210526_162747"
down_revision = "20210524_233229"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "samples",
        sa.Column("uploaded_by_id", sa.Integer(), nullable=True),
        schema="aspen",
    )
    op.create_foreign_key(
        op.f("fk_samples_uploaded_by_id_users"),
        "samples",
        "users",
        ["uploaded_by_id"],
        ["id"],
        source_schema="aspen",
        referent_schema="aspen",
    )


def downgrade():
    op.drop_constraint(
        op.f("fk_samples_uploaded_by_id_users"),
        "samples",
        schema="aspen",
        type_="foreignkey",
    )
    op.drop_column("samples", "uploaded_by_id", schema="aspen")
