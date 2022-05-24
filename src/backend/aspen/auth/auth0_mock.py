from datetime import datetime, timedelta
from typing import List
from uuid import uuid1

from aspen.auth.auth0_management import Auth0Client, Auth0Invitation, Auth0Org

import_time = datetime.now()
import_plus_seven = import_time + timedelta(days=7)

MOCK_ORG = {
    "id": f"org_{uuid1()}",
    "name": "Mock Org",
    "display_name": "Mock Org",
}

MOCK_INVITE = {
    "id": f"univ_{uuid1()}",
    "created_at": import_time.isoformat(),
    "expires_at": import_plus_seven.isoformat(),
    "inviter": {"name": "Test User"},
    "invitee": {"email": "hello@test.czgenepi.org"},
}


class MockAuth0Client(Auth0Client):
    def __init__(self, client_id, client_secret, domain) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.domain = domain

    def get_orgs(self) -> List[Auth0Org]:
        return [MOCK_ORG]

    def get_org_by_id(self, org_id: str) -> Auth0Org:
        org_with_id = MOCK_ORG | {"id": org_id}
        return org_with_id

    def get_org_invitations(self, org: Auth0Org) -> List[Auth0Invitation]:
        return [MOCK_INVITE]
