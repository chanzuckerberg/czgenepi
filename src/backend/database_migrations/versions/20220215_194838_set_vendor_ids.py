"""set vendor ids

Create Date: 2022-02-15 19:48:40.620068

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220215_194838"
down_revision = "20220121_112143"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("split_id", sa.String(), nullable=True),
        schema="aspen",
    )
    op.create_index(
        "uq_users_split_id", "users", ["split_id"], schema="aspen", unique=True
    )
    op.execute(
        """
        UPDATE aspen.users set split_id = array_to_string(array(
          select substr('abcdefghijklmnopqrstuvwxyz0123456789',((random()*(36-1)+1)::integer),1) from generate_series(1,20) where users.id = users.id 
        ),'');
    """
    )
    op.alter_column(
        "users",
        "split_id",
        existing_type=sa.VARCHAR(),
        nullable=True,
        schema="aspen",
    )


def downgrade():
    raise NotImplementedError("don't downgrade")
