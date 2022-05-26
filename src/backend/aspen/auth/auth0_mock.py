from datetime import datetime, timedelta
from functools import cache
from typing import List
from uuid import uuid1

from aspen.auth.auth0_management import Auth0Client, Auth0Invitation, Auth0Org

import_time = datetime.now()
import_plus_seven = import_time + timedelta(days=7)

MOCK_ORG: Auth0Org = {
    "id": f"org_{uuid1()}",
    "name": "Mock Org",
    "display_name": "Mock Org",
}

MOCK_INVITE: Auth0Invitation = {
    "id": f"univ_{uuid1()}",
    "created_at": import_time.isoformat(),
    "expires_at": import_plus_seven.isoformat(),
    "inviter": {"name": "Test User"},
    "invitee": {"email": "hello@test.czgenepi.org"},
}


# @cache is just to match function signatures
class MockAuth0Client(Auth0Client):
    def __init__(self, client_id, client_secret, domain) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.domain = domain

    @cache
    def get_orgs(self) -> List[Auth0Org]:
        return [MOCK_ORG]

    @cache
    def get_org_by_id(self, org_id: str) -> Auth0Org:
        org_with_id: Auth0Org = {
            "id": org_id,
            "name": MOCK_ORG["name"],
            "display_name": MOCK_ORG["display_name"],
        }
        return org_with_id

    def get_org_invitations(self, org: Auth0Org) -> List[Auth0Invitation]:
        return [MOCK_INVITE]
