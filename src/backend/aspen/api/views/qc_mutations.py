"""Views around Quality Control and/or Mutations info."""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from typing import Iterable

from aspen.api.authn import AuthContext, get_auth_context
from aspen.api.authz import AuthZSession, get_authz_session
from aspen.api.deps import get_db, get_pathogen
from aspen.api.error import http_exceptions as ex
from aspen.api.schemas.qc_mutations import QcMutationsRequest
from aspen.api.utils import samples_by_identifiers, NextcladeQcMutationsOutputStreamer
from aspen.database.models import Pathogen, Sample


router = APIRouter()

@router.post("/")
async def download_qc_mutations_output(
    request: QcMutationsRequest,
    db: AsyncSession = Depends(get_db),
    az: AuthZSession = Depends(get_authz_session),
    ac: AuthContext = Depends(get_auth_context),
    pathogen: Pathogen = Depends(get_pathogen),
) -> StreamingResponse:
    """Downloads a file of QC/Mutations data for the specified samples.

    Note that this is very much tied to Nextclade right now and how we process
    QC/Mutations info. All our QC/Mutations calls go through Nextclade right
    now (Dec 2022), and the current intention of this endpoint is to give the
    user a way to grab the raw Nextclade output for their chosen samples.

    For the QC/Mutations data to be downloaded for a given sample:
      1. The user must be authorized to access that sample.
      2. The sample needs to match the specified pathogen (from URL)
      3. There needs to be QC/Mutations data available for the sample.
        ^^^ There always _should_ be eventually, but it might not be available
        immediately after a new sample gets uploaded b/c processing time.
    """
    sample_ids = request.sample_ids
    sample_query = await samples_by_identifiers(
        az, pathogen, sample_ids,
    )
    sample_query = sample_query.options(
        # `innerjoin` /only/ returns samples that have a qc_metric connected
        # If a sample has no qc_metrics, it will not get pulled.
        joinedload(Sample.qc_metrics, innerjoin=True)
    )

    all_samples = await db.execute(sample_query)
    fields_in_use, data = prepare_output_data(all_samples.unique().scalars(), ac)
    if len(data) == 0:
        raise ex.NotFoundException("No associated QC/Mutation data found")

    streamer = NextcladeQcMutationsOutputStreamer(
        "sample_mutation.tsv",
        fields_in_use,
        data,
        )
    return streamer.get_response()


def prepare_output_data(samples: Iterable[Sample], ac: AuthContext):
    """Preps QC/Mutations data from the samples for download.

    Note that this is very much tied to Nextclade right now and how we process
    QC/Mutations info. Right now (Dec 2022), the only way to get QC/Mutations
    info on a sample is by running Nextclade. Additionally, every sample should
    only ever have a single associated `qc_metrics` from Nextclade. So the code
    here assumes our `qc_metrics` list has a single element and that it's the
    result of a Nextclade run.

    While the fields that a Nextclade run returns are fairly consistent, there
    is a bit of difference in what it returns from one pathogen to another, and
    possibly could also change between Nextclade versions or reference dataset.
    To handle this, we capture all the `fields_in_use` for our samples, and use
    that to inform what fields should be provided in the final download. It's
    probably overkill -- 99% of the time, every single sample will have the
    same set of fields -- but it protects us against the edge case where some
    fields get dropped because they shifted between Nextclade runs.

    TODO -- If / when we start supporting other QC/Mutations calling tools,
    generalize this process to be able to handle those different kinds of
    outputs and stop assuming that the `qc_metrics` list is always length 1.
    """
    fields_in_use = set()
    data = []
    for sample in samples:
        # NOTE -- Assuming structure of exactly one Nextclade run. See above.
        raw_qc_output = sample.qc_metrics[0].raw_qc_output
        # Using a copy to avoid altering original DB object
        sample_data = raw_qc_output.copy()
        NEXTCLADE_ID_FIELD = "seqName"
        if sample.submitting_group_id == ac.group.id:  # type: ignore
            sample_data[NEXTCLADE_ID_FIELD] = sample.private_identifier
        else:
            sample_data[NEXTCLADE_ID_FIELD] = sample.public_identifier
        fields_in_use.update(sample_data.keys())
        data.append(sample_data)
    return fields_in_use, data
