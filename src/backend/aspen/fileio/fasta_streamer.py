from typing import Iterable, Set

from sqlalchemy.orm import joinedload

from aspen.app.views.api_utils import authz_sample_filters
from aspen.database.models import DataType, Sample, UploadedPathogenGenome
from aspen.database.models.usergroup import User


class FastaStreamer:
    def __init__(self, user: User, sample_ids, db_session):
        self.user = user
        self.cansee_groups_private_identifiers: Set[int] = {
            cansee.owner_group_id
            for cansee in user.group.can_see
            if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
        }
        # query for samples
        self.all_samples: Iterable[Sample] = (
            db_session.query(Sample)
            .yield_per(
                5
            )  # Streams a few DB rows at a time but our query must return one row per resolved object.
            .options(
                joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(
                    UploadedPathogenGenome.sequence
                ),
            )
        )
        # Enforce AuthZ
        self.all_samples = authz_sample_filters(self.all_samples, sample_ids, user)

    def stream(self):
        for sample in self.all_samples:
            if sample.uploaded_pathogen_genome:
                pathogen_genome: UploadedPathogenGenome = (
                    sample.uploaded_pathogen_genome
                )
                sequence: str = "".join(
                    [
                        line
                        for line in pathogen_genome.sequence.splitlines()  # type: ignore
                        if not (line.startswith(">") or line.startswith(";"))
                    ]
                )
                stripped_sequence: str = sequence.strip("Nn")
                # use private id if the user has access to it, else public id
                if (
                    sample.submitting_group_id == self.user.group_id
                    or sample.submitting_group_id
                    in self.cansee_groups_private_identifiers
                    or self.user.system_admin
                ):
                    yield (f">{sample.private_identifier}\n")  # type: ignore
                else:
                    yield (f">{sample.public_identifier}\n")
                yield (stripped_sequence)
                yield ("\n")
