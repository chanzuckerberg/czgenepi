from __future__ import annotations

from sqlalchemy import Column, String

from aspen.database.models.base import idbase


class PublicRepository(idbase):  # type: ignore
    """Public database of pathogen sequencing data, ex: GISAID/ GenBank"""

    __tablename__ = "public_repositories"

    name = Column(
        String,
        nullable=False,
        unique=True,
        comment=("Public Repository abbreviated name (ex: GISAID/GenBank)"),
    )
