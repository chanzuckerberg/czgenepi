import pytest
from sqlalchemy.exc import InvalidRequestError
from sqlalchemy.orm import undefer

from aspen.database.models.sequences import UploadedPathogenGenome
from aspen.test_infra.models.location import location_factory
from aspen.test_infra.models.pathogen import random_pathogen_factory
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_uploaded_pathogen_genome(session):
    group = group_factory()
    uploaded_by_user = user_factory(group)
    pathogen = random_pathogen_factory()
    location = location_factory(
        "North America", "USA", "California", "Santa Barbara County"
    )
    sample = sample_factory(group, uploaded_by_user, location, pathogen=pathogen)
    uploaded_pathogen_genome = UploadedPathogenGenome(
        sample=sample,
        sequence="GAGAGACTCTCT",
        num_unambiguous_sites=8,
        num_missing_alleles=2,
        num_mixed=2,
    )

    session.add_all(
        (
            group,
            sample,
            uploaded_pathogen_genome,
        )
    )
    session.flush()

    # expire the data and try to implicitly load the sequence data.  it should fail.
    session.expire_all()
    uploaded_pathogen_genome = session.query(UploadedPathogenGenome).one()
    with pytest.raises(InvalidRequestError):
        uploaded_pathogen_genome.sequence

    # expire the data and try to explicitly load the sequence data.
    # it should succeed.
    session.expire_all()
    uploaded_pathogen_genome = (
        session.query(UploadedPathogenGenome)
        .options(undefer(UploadedPathogenGenome.sequence))
        .one()
    )
    uploaded_pathogen_genome.sequence
