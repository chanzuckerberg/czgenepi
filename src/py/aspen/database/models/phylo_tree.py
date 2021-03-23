from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import backref, relationship

from aspen.database.models.entity import Entity, EntityType
from aspen.database.models.usergroup import Group
from aspen.database.models.workflow import Workflow, WorkflowType


class PhyloTree(Entity):
    __tablename__ = "phylo_trees"
    __table_args__ = (UniqueConstraint("s3_bucket", "s3_key"),)
    __mapper_args__ = {"polymorphic_identity": EntityType.PHYLO_TREE}

    entity_id = Column(Integer, ForeignKey(Entity.id), primary_key=True)

    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)


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

    def tree(self) -> PhyloTree:
        """Find the tree resulting from this workflow."""
        for output in self.outputs:
            if isinstance(output, PhyloTree):
                return output
        raise ValueError(
            f"No phylo tree was generated from this workflow (id={self.id}."
        )
