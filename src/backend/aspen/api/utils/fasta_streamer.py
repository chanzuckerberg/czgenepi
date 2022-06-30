import re
from enum import Enum
from typing import AsyncGenerator, Optional, Set

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.utils import authz_sample_filters
from aspen.database.models import Sample, UploadedPathogenGenome
from aspen.database.models.usergroup import User


class SpecialtyDownstreams(Enum):
    """Canonical internal/external names for downstreams that require special logic."""

    USHER = "USHER"


class FastaStreamer:
    def __init__(
        self,
        db: AsyncSession,
        user: User,
        sample_ids: Set[str],
        downstream_consumer: Optional[str] = None,
    ):
        self.db = db
        self.user = user
        # query for samples
        all_samples_query = sa.select(Sample).options(  # type: ignore
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(  # type: ignore
                UploadedPathogenGenome.sequence
            ),
        )
        # Enforce AuthZ
        self.authz_samples_query = authz_sample_filters(
            all_samples_query, sample_ids, user
        )
        # Stream results
        # Certain consumers have different requirements on fasta
        self.downstream_consumer = downstream_consumer

    async def stream(self) -> AsyncGenerator[str, None]:
        all_samples = await self.db.stream(self.authz_samples_query)
        async for sample in all_samples.scalars():
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
        output_id = identifier  # default, might get changed if specialty case
        if self.downstream_consumer == SpecialtyDownstreams.USHER.value:
            output_id = self._handle_usher_id(identifier)
        return f">{output_id}\n"

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
