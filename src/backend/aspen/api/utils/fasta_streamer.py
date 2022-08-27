import re
from enum import Enum
from typing import AsyncGenerator, Optional, Set

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from aspen.api.authn import AuthContext
from aspen.api.authz import AuthZSession
from aspen.api.utils import samples_by_identifiers
from aspen.api.utils.sample import (  # #### phoenix move this to init file
    get_public_repository_prefix,
)
from aspen.database.models import Sample, UploadedPathogenGenome


class SpecialtyDownstreams(Enum):
    """Canonical internal/external names for downstreams that require special logic."""

    USHER = "USHER"


class FastaStreamer:
    def __init__(
        self,
        db: AsyncSession,
        az: AuthZSession,
        ac: AuthContext,
        sample_ids: Set[str],
        public_repository_type: str,
        pathogen_slug: str,
        downstream_consumer: Optional[str] = None,
    ):
        self.db = db
        self.ac = ac
        self.az = az
        self.sample_ids = sample_ids
        self.public_repository_type = public_repository_type
        self.pathogen_slug = pathogen_slug
        # Certain consumers have different requirements on fasta
        self.downstream_consumer = downstream_consumer

    async def stream(self) -> AsyncGenerator[str, None]:
        # query for samples
        sample_query = await samples_by_identifiers(
            self.az, self.sample_ids, "sequences"
        )
        sample_query = sample_query.options(  # type: ignore
            joinedload(Sample.uploaded_pathogen_genome, innerjoin=True).undefer(  # type: ignore
                UploadedPathogenGenome.sequence
            )
        )

        # Stream results
        all_samples = await self.db.stream(sample_query)
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
                if sample.submitting_group_id == self.ac.group.id:  # type: ignore
                    yield await self._output_id_line(sample.private_identifier)
                else:
                    yield await self._output_id_line(sample.public_identifier)
                yield stripped_sequence
                yield "\n"

    async def _output_id_line(self, identifier) -> str:
        """Produces the ID line for current sequence in fasta.

        Certain downstream consumers (eg, UShER) restrict what characters can be
        used in the ID. Also handles any modifications that must be made to ID
        characters so they don't break the downstream consumer."""

        if self.public_repository_type:
            # get the sample id prefix for given public_repository
            prefix = await get_public_repository_prefix(
                self.public_repository_type, self.pathogen_slug, self.db
            )
            output_id = f'{prefix}/{identifier.lstrip("hCoV-19/")}'  # default, might get changed if specialty case
        else:
            # user is proceeding with normal download, and does not wish to submit to gisaid or genbank
            output_id = identifier
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
