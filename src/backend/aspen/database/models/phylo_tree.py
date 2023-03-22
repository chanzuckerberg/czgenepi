import enum

import enumtables
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref, relationship

from aspen.database.models.base import base
from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.enum import Enum
from aspen.database.models.pathogens import Pathogen
from aspen.database.models.public_repositories import PublicRepository
from aspen.database.models.sample import Sample
from aspen.database.models.usergroup import Group
from aspen.database.models.workflow import Workflow, WorkflowType

_PHYLO_TREE_TABLENAME = "phylo_trees"


class TreeType(enum.Enum):
    OVERVIEW = "OVERVIEW"
    TARGETED = "TARGETED"
    NON_CONTEXTUALIZED = "NON_CONTEXTUALIZED"
    UNKNOWN = "UNKNOWN"  # For old data imported from COVIDHub. Should never show up otherwise.


_TreeTypeTable = enumtables.EnumTable(
    TreeType,
    base,
    tablename="tree_types",
)

PhyloTreeSamples = Table(
    "phylo_tree_samples",
    base.metadata,  # type: ignore
    Column("sample_id", ForeignKey(Sample.id), primary_key=True),
    Column(
        "phylo_tree_id",
        ForeignKey(f"{_PHYLO_TREE_TABLENAME}.entity_id"),
        primary_key=True,
    ),
)
"""This table records which samples are included in the phylo tree.  Note that this is
different from which samples are inputs into the build that creates a phylo tree."""


class PhyloTree(Entity):
    __tablename__ = _PHYLO_TREE_TABLENAME
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)
    __mapper_args__ = {"polymorphic_identity": EntityType.PHYLO_TREE}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)

    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    name = Column(String, nullable=True)

    pathogen_id = Column(Integer, ForeignKey(Pathogen.id), nullable=False)
    pathogen: Pathogen = relationship(Pathogen, back_populates="phylo_trees")  # type: ignore
    contextual_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    contextual_repository: PublicRepository = relationship(PublicRepository, back_populates="contextual_trees")  # type: ignore

    constituent_samples = relationship(  # type: ignore
        Sample,
        secondary=PhyloTreeSamples,
        backref="phylo_trees",
        uselist=True,
    )

    tree_type = Column(
        Enum(TreeType),
        ForeignKey(_TreeTypeTable.item_id),
        nullable=False,
    )

    # The "interpreted" version of the template_args for doing a PhyloRun.
    # While PhyloRun.template_args represents the args as originally submitted,
    # resolved_template_args is what we extrapolated those args to mean during
    # the tree build process.
    # NULL for trees prior to Nov 2022 (ie, before this column was added).
    # TODO evaluate setting a default {} once in use.
    resolved_template_args = Column(JSONB, nullable=True)

    def __str__(self) -> str:
        return f"PhyloTree <id={self.entity_id}>"


class PhyloRun(Workflow):
    __tablename__ = "phylo_runs"
    __mapper_args__ = {"polymorphic_identity": WorkflowType.PHYLO_RUN}

    workflow_id = Column(Integer, ForeignKey(Workflow.id), primary_key=True)
    group_id = Column(
        Integer,
        ForeignKey(Group.id),
        nullable=False,
    )
    group = relationship(Group, backref=backref("phylo_runs", uselist=True))  # type: ignore

    pathogen_id = Column(
        Integer, ForeignKey(Pathogen.id), nullable=False
    )  # TODO: change to nullable=False once we update workflows
    pathogen: Pathogen = relationship(Pathogen, back_populates="phylo_runs")  # type: ignore
    contextual_repository_id = Column(
        Integer, ForeignKey(PublicRepository.id), nullable=False
    )
    contextual_repository: PublicRepository = relationship(PublicRepository, back_populates="contextual_phyloruns")  # type: ignore

    template_file_path = Column(String, nullable=True)
    """[Tony Tung, Spring2021] This is the path, relative to aspen root, for
    the builds template file.  For all new builds, this should be set.
    However, for runs imported from covidhub, this would not be available.

    [Vincent, Fall2022] Above appears not to be true anymore, and seems to have
    stopped being true at end of 2021. TODO Potentially remove this column?
    """

    # Store a list of gisaid ID's we're going to use as inputs
    # to the phylo run.
    gisaid_ids = Column(
        JSONB,
        nullable=False,
        default=text("'[]'::jsonb"),
        server_default=text("'[]'::jsonb"),
    )

    template_args = Column(
        JSONB,
        nullable=False,
        default=text("'{}'::jsonb"),
        server_default=text("'{}'::jsonb"),
    )
    """The arguments, in conjunction with the template file, used to produce the final
    builds file. These args represent the literal args given by the request
    that kicked off the phylo_run. While we filter the original args down to
    just those args our app supports, this is generally intended to be the args
    as originally sent, before any additional interpretation/extrapolation.
    To see what the args wind up being extrapolated to, see the column
    PhyloTree.resolved_template_args"""

    name = Column(String, nullable=True)

    tree_type = Column(
        Enum(TreeType),
        ForeignKey(_TreeTypeTable.item_id),
        nullable=False,
    )

    def tree(self) -> PhyloTree:
        """Find the tree resulting from this workflow."""
        for output in self.outputs:
            if isinstance(output, PhyloTree):
                return output
        raise ValueError(
            f"No phylo tree was generated from this workflow (id={self.id}."
        )
