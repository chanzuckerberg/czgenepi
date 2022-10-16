# isort: skip_file
from sqlalchemy.orm import configure_mappers

from aspen.database.models.base import meta  # noqa: F401
from aspen.database.models.entity import Entity, EntityType  # noqa: F401
from aspen.database.models.accessions import Accession, AccessionType  # noqa: F401
from aspen.database.models.pathogens import Pathogen, PathogenRepoConfig  # noqa: F401
from aspen.database.models.public_repositories import PublicRepository  # noqa: F401
from aspen.database.models.public_repository_metadata import (  # noqa: F401
    PublicRepositoryMetadata,
)
from aspen.database.models.workflow import (  # noqa: F401
    Workflow,
    WorkflowInputs,
    WorkflowStatusType,
    WorkflowType,
)
from aspen.database.models.gisaid_dump import (  # noqa: F401
    AlignedGisaidDump,
    GisaidAlignmentWorkflow,
    GisaidDumpWorkflow,
    ProcessedGisaidDump,
    RawGisaidDump,
)
from aspen.database.models.gisaid_metadata import GisaidMetadata  # noqa: F401
from aspen.database.models.lineages import (  # noqa: F401
    PangoLineage,
    PathogenLineage,
    SampleLineage,
    SampleQCMetric,
)
from aspen.database.models.locations import Location  # noqa: F401
from aspen.database.models.mutations import SampleMutation  # noqa: F401
from aspen.database.models.phylo_tree import (  # noqa: F401
    PhyloRun,
    PhyloTree,
    PhyloTreeSamples,
    TreeType,
)
from aspen.database.models.repository_workflows import (  # noqa: F401
    AlignedRepositoryData,
    ProcessedRepositoryData,
    RawRepositoryData,
    RepositoryAlignmentWorkflow,
    RepositoryDownloadWorkflow,
)
from aspen.database.models.sample import Sample  # noqa: F401
from aspen.database.models.sequences import (  # noqa: F401
    AlignedPathogenGenome,
    AlignedPeptides,
    PathogenGenome,
    UploadedPathogenGenome,
)
from aspen.database.models.usergroup import (  # noqa: F401
    Group,
    GroupRole,
    Role,
    User,
    UserRole,
)
from aspen.database.models.usher import UsherOption  # noqa: F401
from aspen.database.models.workflow import (  # noqa: F401
    Workflow,
    WorkflowInputs,
    WorkflowStatusType,
    WorkflowType,
)

configure_mappers()
