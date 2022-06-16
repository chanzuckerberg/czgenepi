from sqlalchemy.orm import configure_mappers

from aspen.database.models.accessions import Accession, AccessionType  # noqa: F401
from aspen.database.models.base import meta  # noqa: F401
from aspen.database.models.cansee import CanSee, DataType  # noqa: F401
from aspen.database.models.entity import Entity, EntityType  # noqa: F401
from aspen.database.models.gisaid_dump import (  # noqa: F401
    AlignedGisaidDump,
    GisaidAlignmentWorkflow,
    GisaidDumpWorkflow,
    ProcessedGisaidDump,
    RawGisaidDump,
)
from aspen.database.models.gisaid_metadata import GisaidMetadata  # noqa: F401
from aspen.database.models.locations import Location  # noqa: F401
from aspen.database.models.pango_lineages import PangoLineage  # noqa: F401
from aspen.database.models.phylo_tree import (  # noqa: F401
    PhyloRun,
    PhyloTree,
    PhyloTreeSamples,
    TreeType,
)
from aspen.database.models.sample import Sample  # noqa: F401
from aspen.database.models.sequences import (  # noqa: F401
    PathogenGenome,
    UploadedPathogenGenome,
)
from aspen.database.models.usergroup import Group, Role, User, UserRole, GroupRole  # noqa: F401
from aspen.database.models.usher import UsherOption  # noqa: F401
from aspen.database.models.workflow import (  # noqa: F401
    Workflow,
    WorkflowInputs,
    WorkflowStatusType,
    WorkflowType,
)

configure_mappers()
