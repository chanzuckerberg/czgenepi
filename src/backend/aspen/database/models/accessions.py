from __future__ import annotations

import enum

import enumtables
from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from aspen.database.models.base import base
from aspen.database.models.enum import Enum


class AccessionType(enum.Enum):
    GISAID_ISL = "GISAID_ISL"
    GENBANK = "GENBANK"


_AccessionTypeTable = enumtables.EnumTable(
    AccessionType,
    base,
    tablename="accession_types",
)


class Accession(base):  # type: ignore
    """An accession for a single sample."""

    __tablename__ = "accessions"
    __table_args__ = (
        UniqueConstraint(
            "sample_id",
            "accession_type",
            name="uq_accessions_sample_id_accession_type",
        ),
    )

    sample_id = Column(Integer, ForeignKey("samples.id"), primary_key=True)

    accession_type = Column(
        Enum(AccessionType),
        ForeignKey(_AccessionTypeTable.item_id),
        nullable=False,
    )

    accession = Column(String, nullable=False)
