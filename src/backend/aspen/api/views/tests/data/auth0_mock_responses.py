from aspen.auth.auth0_management import (
    Auth0Invitation,
    Auth0Org,
    Auth0User,
)


DEFAULT_AUTH0_ORG: Auth0Org = {
    "id": "testid",
    "name": "testname",
    "display_name": "testdisplayname",
}

DEFAULT_AUTH0_USER: Auth0User = {
    "user_id": "testuserid",
    "name": "test user",
    "email": "test@czgenepi.org",
}
DEFAULT_AUTH0_INVITATION: Auth0Invitation = {
    "id": "inv_id",
    "created_at": "2022-01-01",
    "expires_at": "2022-06-01",
    "inviter": {"name": "Bob"},
    "invitee": {"email": "invitee@czgenepi.org"},
}