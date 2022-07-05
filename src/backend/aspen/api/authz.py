from functools import lru_cache
from pathlib import Path

from fastapi import Depends
from oso import AsyncOso, Relation
from polar.data.adapter.async_sqlalchemy2_adapter import AsyncSqlAlchemyAdapter
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.authn import AuthContext, get_auth_context
from aspen.api.deps import get_db
from aspen.database.models import (
    Group,
    GroupRole,
    PhyloRun,
    PhyloTree,
    Role,
    Sample,
    User,
    UserRole,
)
from aspen.database.models.base import idbase


def register_classes(oso):
    oso.register_class(
        AuthContext,
        fields={"user": User, "group": Group, "roles": list, "group_roles": list},
    )
    oso.register_class(
        GroupRole,
        fields={
            "id": int,
            "grantor_group_id": int,
            "grantee_group_id": int,
            "grantor_group": Relation(
                kind="one",
                other_type="Group",
                my_field="grantor_group_id",
                other_field="id",
            ),
            "role": Relation(
                kind="one", other_type="Role", my_field="role_id", other_field="id"
            ),
            "grantee_group": Relation(
                kind="one",
                other_type="Group",
                my_field="grantee_group_id",
                other_field="id",
            ),
        },
    )
    oso.register_class(
        Group,
        fields={
            "id": int,
            "grantee_roles": Relation(
                kind="many",
                other_type="GroupRole",
                my_field="id",
                other_field="grantee_group_id",
            ),
        },
    )
    oso.register_class(Role, fields={"id": int, "name": str})
    oso.register_class(
        User,
        fields={
            "id": str,
            "user_roles": Relation(
                kind="many",
                other_type="UserRole",
                my_field="id",
                other_field="user_id",
            ),
        },
    )
    oso.register_class(
        UserRole,
        fields={
            "id": int,
            "group_id": int,
            "role_id": int,
            "user_id": int,
            "group": Relation(
                kind="one", other_type="Group", my_field="group_id", other_field="id"
            ),
            "role": Relation(
                kind="one", other_type="Role", my_field="role_id", other_field="id"
            ),
            "user": Relation(
                kind="one", other_type="User", my_field="user_id", other_field="id"
            ),
        },
    )

    oso.register_class(
        Sample,
        fields={
            "id": int,
            "private": bool,
            "submitting_group_id": int,
            "submitting_group": Relation(
                kind="one",
                other_type="Group",
                my_field="submitting_group_id",
                other_field="id",
            ),
        },
    )
    oso.register_class(
        PhyloRun,
        fields={
            "id": int,
            "group_id": int,
            "workflow_id": int,
            "group": Relation(
                kind="one", other_type="Group", my_field="group_id", other_field="id"
            ),
        },
    )
    oso.register_class(
        PhyloTree,
        fields={
            "id": str,
            "producing_workflow_id": int,
            "phylo_run": Relation(
                kind="one",
                other_type="PhyloRun",
                my_field="producing_workflow_id",
                other_field="workflow_id",
            ),
        },
    )


# This is just a thin indirection/wrapper for Oso's interface in case we need to swap it out
# with something else in the future.
class AuthZSession:
    def __init__(self, session, auth_context):
        oso = AsyncOso()
        oso.set_data_filtering_adapter(AsyncSqlAlchemyAdapter(session))
        register_classes(oso)
        self.auth_context = auth_context
        self.oso = oso
        self.config_loaded = False

    async def load_config(self):
        await self.oso.load_files(
            [Path.joinpath(Path(__file__).parent.absolute(), "policy.polar")]
        )
        self.config_loaded = True

    async def authorized_query(self, privilege: str, model: idbase):
        # Temp hack to avoid an await in __init__
        if not self.config_loaded:
            await self.load_config()
        return await self.oso.authorized_query(self.auth_context, privilege, model)


async def get_authz_session(
    request: Request,
    auth_context: AuthContext = Depends(get_auth_context),
    session: AsyncSession = Depends(get_db),
) -> AuthZSession:
    return AuthZSession(session, auth_context)


class AuthorizedSession:
    def __init__(self, privilege: str, model: idbase):
        self.privilege = privilege
        self.model = model

    async def __call__(
        self,
        auth_context: AuthContext = Depends(get_auth_context),
        session: AsyncSession = Depends(get_db),
    ):
        authz_session = AuthZSession(session, auth_context)
        return await authz_session.authorized_query(self.privilege, self.model)


@lru_cache
def require_access(
    privilege: str,
    model: idbase,
) -> AuthorizedSession:
    return AuthorizedSession(privilege, model)
