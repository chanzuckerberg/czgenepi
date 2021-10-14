from typing import Iterable

import sentry_sdk
from flask import g, make_response, request
from marshmallow.exceptions import ValidationError

from aspen.app.app import application, requires_auth
from aspen.app.serializers import ValidateIDsRequestSchema, ValidateIDsResponseSchema
from aspen.app.views.api_utils import (
    authz_sample_filters,
    get_matching_gisaid_ids,
    get_missing_sample_ids,
)
from aspen.database.models import GisaidMetadata, Sample
from aspen.error import http_exceptions as ex


@application.route("/api/validate/ids")
@requires_auth
def validate_ids():
    """
    take in a list of identifiers and checks if all idenitifiers exist as either Sample public or private identifiers, or GisaidMetadata strain names

    returns a response with list of missing identifiers if any, otherwise will return an empty list
    """

    user = g.auth_user

    validator = ValidateIDsRequestSchema()
    request_json = request.get_json()

    try:
        request_data = validator.load(request_json)
    except ValidationError as verr:
        sentry_sdk.capture_message("Invalid API request to /api/validate/ids", "info")
        raise ex.BadRequestException(str(verr))

    sample_ids: Iterable[str] = request_data["sample_ids"]

    all_samples: Iterable[Sample] = g.db_session.query(Sample)

    # get all samples from request that the user has permission to use
    all_samples = authz_sample_filters(all_samples, sample_ids, user)

    # Are there any sample ID's that don't match sample table public and private identifiers
    missing_sample_ids = get_missing_sample_ids(sample_ids, all_samples)

    # See if these missing_sample_ids match any Gisaid identifiers
    gisaid_ids = get_matching_gisaid_ids(missing_sample_ids, g.db_session)

    # Do we have any samples that are not aspen private or public identifiers or gisaid identifiers?
    missing_sample_ids = missing_sample_ids - gisaid_ids

    responseschema = ValidateIDsResponseSchema()

    response = make_response(
        responseschema.dumps({"missing_sample_ids": missing_sample_ids}), 200
    )
    response.headers["Content-Type"] = "application/json"
    return response
