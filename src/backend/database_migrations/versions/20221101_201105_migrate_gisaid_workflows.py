"""migrate-gisaid-workflows

Create Date: 2022-11-01 20:11:11.032163

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20221101_201105"
down_revision = "20221026_212147"
branch_labels = None
depends_on = None


def upgrade():

    # Entities
    op.execute(
        """
        INSERT INTO aspen.aligned_repository_data (entity_id, pathogen_id, public_repository_id, s3_bucket, sequences_s3_key, metadata_s3_key)
        SELECT agd.entity_id, p.id, pr.id, agd.s3_bucket, agd.sequences_s3_key, agd.metadata_s3_key from
        aspen.aligned_gisaid_dump agd, 
        aspen.pathogens p,
        aspen.public_repositories pr
        WHERE p.slug = 'SC2' AND pr.name = 'GISAID'
        """
    )
    op.execute(
        """
        INSERT INTO aspen.processed_repository_data (entity_id, pathogen_id, public_repository_id, s3_bucket, sequences_s3_key, metadata_s3_key)
        SELECT pgd.entity_id, p.id, pr.id, pgd.s3_bucket, pgd.sequences_s3_key, pgd.metadata_s3_key from
        aspen.processed_gisaid_dump pgd, 
        aspen.pathogens p,
        aspen.public_repositories pr
        WHERE p.slug = 'SC2' AND pr.name = 'GISAID'
        """
    )
    op.execute(
        """
        INSERT INTO aspen.raw_repository_data (entity_id, pathogen_id, public_repository_id, download_date, s3_bucket, s3_key)
        SELECT rgd.entity_id, p.id, pr.id, rgd.download_date, rgd.s3_bucket, rgd.s3_key from
        aspen.raw_gisaid_dump rgd, 
        aspen.pathogens p,
        aspen.public_repositories pr
        WHERE p.slug = 'SC2' AND pr.name = 'GISAID'
        """
    )

    # Workflows
    op.execute(
        """
        INSERT INTO aspen.repository_download_workflows (workflow_id, pathogen_id, public_repository_id)
        SELECT gaw.workflow_id, p.id, pr.id from
        aspen.gisaid_alignment_workflows gaw, 
        aspen.pathogens p,
        aspen.public_repositories pr
        WHERE p.slug = 'SC2' AND pr.name = 'GISAID'
        """
    )
    op.execute(
        """
        INSERT INTO aspen.repository_download_workflows (workflow_id, pathogen_id, public_repository_id)
        SELECT gw.workflow_id, p.id, pr.id from
        aspen.gisaid_workflows gw, 
        aspen.pathogens p,
        aspen.public_repositories pr
        WHERE p.slug = 'SC2' AND pr.name = 'GISAID'
        """
    )

    # Switch entity inheritance types
    op.execute(
        """
        UPDATE aspen.entities SET entity_type = 'RAW_PUBLIC_REPOSITORY_DATA' WHERE entity_type = 'RAW_GISAID_DUMP'
        """
    )
    op.execute(
        """
        UPDATE aspen.entities SET entity_type = 'PROCESSED_PUBLIC_REPOSITORY_DATA' WHERE entity_type = 'PROCESSED_GISAID_DUMP'
        """
    )
    op.execute(
        """
        UPDATE aspen.entities SET entity_type = 'ALIGNED_PUBLIC_REPOSITORY_DATA' WHERE entity_type = 'ALIGNED_GISAID_DUMP'
        """
    )
    # Switch workflow inheritance types
    op.execute(
        """
        UPDATE aspen.workflows SET workflow_type = 'ALIGN_PUBLIC_REPOSITORY_DATA' WHERE workflow_type = 'ALIGN_GISAID_DUMP'
        """
    )
    op.execute(
        """
        UPDATE aspen.workflows SET workflow_type = 'DOWNLOAD_PUBLIC_REPOSITORY_DATA' WHERE workflow_type = 'PROCESS_GISAID_DUMP'
        """
    )


def downgrade():
    raise NotImplementedError("Downgrading the DB is not allowed")
