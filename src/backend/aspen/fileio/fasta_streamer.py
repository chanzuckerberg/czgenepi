import re
from enum import Enum
from typing import Iterator, Optional, Set

from sqlalchemy.orm import joinedload, Session
from sqlalchemy.orm.query import Query

from aspen.app.views.api_utils import authz_sample_filters
from aspen.database.models import DataType, Sample, UploadedPathogenGenome
from aspen.database.models.usergroup import User


class SpecialtyDownstreams(Enum):
    """Canonical internal/external names for downstreams that require special logic."""

    USHER = "USHER"


class FastaStreamer:
    def __init__(
        self,
        user: User,
        sample_ids: Set[str],
        db_session: Session,
        downstream_consumer: Optional[str] = None,
    ):
        self.user = user
        self.cansee_groups_private_identifiers: Set[int] = {
            cansee.owner_group_id
            for cansee in user.group.can_see
            if cansee.data_type == DataType.PRIVATE_IDENTIFIERS
        }
        # query for samples
        self.all_samples: Query = (
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
        # Certain consumers have different requirements on fasta
        self.downstream_consumer = downstream_consumer

    def stream(self) -> Iterator[str]:
        for sample in self.all_samples:
            if sample.uploaded_pathogen_genome:
                pathogen_genome: UploadedPathogenGenome = (
                    sample.uploaded_pathogen_genome
                )
                sequence: str = "".join(
                    [
                        line
                        for line in pathogen_genome.sequence.splitlines()
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
                    yield self._output_id_line(sample.private_identifier)
                else:
                    yield self._output_id_line(sample.public_identifier)
                yield stripped_sequence
                yield "\n"

    def _output_id_line(self, identifier) -> str:
        """Produces the ID line for current sequence in fasta.

        Certain downstream consumers (eg, UShER) restrict what characters can be
        used in the ID. Also handles any modifications that must be made to ID
        characters so they don't break the downstream consumer."""
        if self.downstream_consumer == SpecialtyDownstreams.USHER.value:
            output_ready_id = self._handle_usher_id(identifier)
        else:
            output_ready_id = identifier
        return f">{output_ready_id}\n"

    def _handle_usher_id(self, identifier) -> str:
        """Convert identifier into something that is UShER safe and roughly the same.

        UShER is allergic to a lot of characters in its sequence ID. It's hard to
        figure out exactly what characters cause problems. I (Vince) mostly figured
        it out from a combo of looking over the source code for handling that aspect
            https://github.com/ucscGenomeBrowser/kent/blob/master/src/lib/phyloTree.c
        and from doing manual testing with characters I wasn't sure about.

        As of Oct 28, 2021, UShER seems happy with only the following characters:
        any latin alpha, any digit, `.`, `_`, `/`, `-`
        With that in mind, anything outside of that we convert to an underscore.
        """
        USHER_UNSAFE_CHARS = r"[^a-zA-Z0-9._/-]"  # complement of the allowed chars
        # Convert every unsafe char into an underscore
        return re.sub(USHER_UNSAFE_CHARS, "_", identifier)
