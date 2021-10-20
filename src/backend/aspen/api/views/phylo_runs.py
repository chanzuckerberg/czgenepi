from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

import sqlalchemy as sa
from sqlalchemy.orm import joinedload

from aspen.api.deps import get_db
from aspen.api.schemas.users import User as userschema
from aspen.database.models.usergroup import User
from aspen.database.models.sample import Sample
from aspen.database.models import TreeType

from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_matching_gisaid_ids,
    get_missing_and_found_sample_ids,
)

from typing import Iterable

import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# schema
from pydantic import BaseModel, ValidationError, validator, constr
from typing import List

# What kinds of ondemand nextstrain builds do we support?
PHYLO_TREE_TYPES = {
    TreeType.NON_CONTEXTUALIZED.value: "non_contextualized.yaml",
    TreeType.TARGETED.value: "targeted.yaml",
}

class PhyloRunRequestSchema(BaseModel):
    name: constr(min_length=1, max_length=128)
    samples: List[str]
    tree_type: str

    @validator('tree_type')
    def tree_type_must_be_supported(cls, value):
        assert PHYLO_TREE_TYPES.get(value.upper())
        return value

class PhyloRunResponseSchema(BaseModel):
    samples: str

# route
router = APIRouter()

@router.post("/")
async def kick_off_phylo_run(phylo_run_request: PhyloRunRequestSchema, request: Request, db: AsyncSession = Depends(get_db)) -> PhyloRunResponseSchema:
    user = request.state.auth_user
    # Note - sample run will be associated with users's primary group.
    #    (do we want admins to be able to start runs on behalf of other dph's ?)
    group = user.group

    # validation happens in input schema

    sample_ids = phylo_run_request.samples
    
    # Step 2 - prepare big sample query per the old db cli
    # all_samples: Iterable[Sample] = db.query(Sample).options(
    #     joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),
    # )
    all_samples_query: Iterable[Sample] = sa.select(Sample).options(joinedload(Sample.uploaded_pathogen_genome, innerjoin=True),)

    # Step 3 - Enforce AuthZ (check if user has permission to see private identifiers and scope down the search for matching ID's to groups that the user has read access to.)
    # user_visible_samples = authz_sample_filters(all_samples, sample_ids, user)
    user_visible_sample_query = authz_sample_filters(all_samples_query, sample_ids, user)
    print(user_visible_sample_query)
    user_visible_samples = await db.execute(user_visible_sample_query)
    user_visible_samples = user_visible_samples.unique().scalars()
    for sample in user_visible_samples:
        print(sample.public_identifier)

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids, found_sample_ids = get_missing_and_found_sample_ids(
        sample_ids, user_visible_samples
    )



    return PhyloRunResponseSchema.parse_obj({ "samples": str(found_sample_ids) })
