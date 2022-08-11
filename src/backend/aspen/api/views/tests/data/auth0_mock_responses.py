from aspen.auth.auth0_management import Auth0Org, Auth0OrgInvitation, Auth0User

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
DEFAULT_AUTH0_INVITATION: Auth0OrgInvitation = {
    "id": "inv_id",
    "created_at": "",
    "expires_at": "2022-06-01",
    "inviter": {"name": "Bob"},
    "invitee": {"email": "invitee@czgenepi.org"},
    "organization_id": "org-1234",
    "invitation_url": "",
    "roles": ["member"],
    "ticket_id": "ticket_id",
    "client_id": "",
    "connection_id": "",
}
