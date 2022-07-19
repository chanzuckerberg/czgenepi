from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import Depends
from oso import AsyncOso, Relation
from polar.data.adapter.async_sqlalchemy2_adapter import AsyncSqlAlchemyAdapter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import NoResultFound
from starlette.requests import Request

from aspen.api.authn import AuthContext, get_auth_context
from aspen.api.deps import get_db
from aspen.api.error import http_exceptions as ex
from aspen.database.models import Group, PhyloRun, PhyloTree, Sample, User
from aspen.database.models.base import idbase


def register_classes(oso):
    oso.register_class(
        AuthContext,
        fields={"user": User, "group": Group, "roles": list, "group_roles": list},
    )
    oso.register_class(
        Group,
        fields={"id": int},
    )
    oso.register_class(
        User,
        fields={
            "id": str,
            "system_admin": bool,
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
            "group_id": int,
            "group": Relation(
                kind="one", other_type="Group", my_field="group_id", other_field="id"
            ),
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
    def __init__(self, session: AsyncSession, auth_context: AuthContext):
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
    auth_context: AuthContext = Depends(get_auth_context),
    session: AsyncSession = Depends(get_db),
) -> AuthZSession:
    return AuthZSession(session, auth_context)


class AuthorizedQuery:
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
) -> AuthorizedQuery:
    return AuthorizedQuery(privilege, model)


class AuthorizedGroup:
    def __init__(self, privilege: str):
        self.privilege = privilege

    async def __call__(
        self,
        ac: AuthContext = Depends(get_auth_context),
        db: AsyncSession = Depends(get_db),
    ):
        authz_session = AuthZSession(db, ac)
        query = (await authz_session.authorized_query(self.privilege, Group)).where(Group.id == ac.group.id)  # type: ignore
        res = await (db.execute(query))
        group = res.scalars().one_or_none()
        if not group:
            raise ex.UnauthorizedException("access denied")
        return group


@lru_cache
def require_group_privilege(
    privilege: str,
) -> AuthorizedGroup:
    return AuthorizedGroup(privilege)


class AuthorizedRow:
    def __init__(self, privilege: str, model: idbase, id_field: Optional[str] = None):
        self.privilege = privilege
        self.model = model
        if not id_field:
            id_field = "row_id"
        self.id_field = id_field

    async def __call__(
        self,
        request: Request,
        auth_context: AuthContext = Depends(get_auth_context),
        session: AsyncSession = Depends(get_db),
    ) -> idbase:
        authz_session = AuthZSession(session, auth_context)
        query = await authz_session.authorized_query(self.privilege, self.model)
        id_value = int(request.path_params[self.id_field])
        try:
            res = (
                (await (session.execute(query.where(self.model.id == id_value))))
                .scalars()
                .one()
            )
            return res
        except NoResultFound:
            raise ex.UnauthorizedException("unauthorized")


@lru_cache
def fetch_authorized_row(
    privilege: str,
    model: idbase,
    id_field: Optional[str] = None,
) -> idbase:
    return AuthorizedRow(privilege, model, id_field)
