"""set tree build names

Create Date: 2022-01-15 01:15:26.068245

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20220115_011524"
down_revision = "20220114_192608"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    old_filenames = sa.sql.text(
        """
      UPDATE aspen.phylo_trees SET name =
        INITCAP( /* title case */
          REPLACE( /* public */
          REPLACE( /* private */
          REPLACE( /* ancestors */
            REPLACE( /* underscores */
              REPLACE( /* .json */
                RIGHT(s3_key, POSITION('/' in REVERSE(s3_key)) - 1) /* Just the filename */
              , '.json', '') /* Strip .json extension */
            , '_', ' ') /* Underscores to spaces */
          , 'ancestors', 'contextual') /* Ancestors -> Contextual */
          , ' public', '') /* Strip public */
          , ' private', '') /* Strip private */
        ) /* title case */
      WHERE name IS NULL AND s3_key NOT LIKE '%ncov_aspen.json';
    """
    )
    conn.execute(old_filenames)

    new_filenames = sa.sql.text(
        """
      UPDATE aspen.phylo_trees SET name =
        REGEXP_REPLACE(
            SUBSTRING(s3_key, POSITION('/' in s3_key) + 1) /* strip the first path segment */
        , '/.*', '')
      WHERE name IS NULL AND s3_key LIKE '%ncov_aspen.json';
    """
    )
    conn.execute(new_filenames)

    # Copy over the name info we populated in the trees table above to the runs table.
    update_runs = sa.sql.text(
        """
      UPDATE aspen.phylo_runs SET name = (SELECT pt.name FROM aspen.phylo_trees pt INNER JOIN aspen.entities e ON e.id = pt.entity_id WHERE e.producing_workflow_id = aspen.phylo_runs.workflow_id) WHERE name IS NULL
    """
    )
    conn.execute(update_runs)


def downgrade():
    raise NotImplementedError("don't downgrade")
