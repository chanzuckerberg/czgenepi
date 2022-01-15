"""set autoubuild tree user

Create Date: 2022-01-14 19:26:10.048670

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220114_192608"
down_revision = "20220103_132500"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Create a new bot group and add our bot user to it.
    create_group_sql = sa.sql.text(
        "INSERT INTO aspen.groups (name, address, prefix, default_tree_location_id) SELECT 'Bot Users', 'Bot Users', 'bot', id FROM aspen.locations WHERE division = 'California' AND location = 'San Mateo County'"
    )
    conn.execute(create_group_sql)

    # There's a unique constraint on user.email, so we're not going to accidentally run into dupe users in the next query.
    create_user_sql = sa.sql.text(
        "INSERT INTO aspen.users (name, email, auth0_user_id, group_admin, system_admin, group_id, agreed_to_tos) SELECT 'Automatic Build', 'hello@czgenepi.org', 'bot_user', 'f', 'f', id, 'f' FROM aspen.groups WHERE prefix = 'bot'"
    )
    conn.execute(create_user_sql)

    # All builds with the following properties will be updated to be associated with our new bot user:
    #  - User ID is null: we don't want to overwrite any user data we already have in the workflows table
    # AND:
    #    - Tree name is null: All on-demand tree builds have the name field populated, and we only recently started populating this field for scheduled runs.
    #    OR:
    #    - The tree type is OVERVIEW. We don't currently support on-demand runs for OVERVIEW trees, so it's safe to update the user for overview runs with populated name fields.
    update_trees_sql = sa.sql.text(
        "UPDATE aspen.workflows SET user_id = ( SELECT id FROM aspen.users WHERE email = 'hello@czgenepi.org') WHERE id IN (SELECT pr.workflow_id FROM aspen.phylo_runs pr INNER JOIN aspen.workflows w ON pr.workflow_id = w.id WHERE w.user_id IS NULL AND (pr.name IS NULL OR pr.tree_type = 'OVERVIEW'))"
    )
    conn.execute(update_trees_sql)


def downgrade():
    raise NotImplementedError("don't downgrade")
