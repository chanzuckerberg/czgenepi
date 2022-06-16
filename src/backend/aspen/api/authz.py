from pathlib import Path
from typing import List

from fastapi import Depends
from oso import AsyncOso, Relation
from polar.data.adapter.async_sqlalchemy2_adapter import AsyncSqlAlchemyAdapter
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import AuthContext
from aspen.api.deps import get_db
from aspen.database.models import (
    Group,
    PhyloRun,
    PhyloTree,
    Role,
    Sample,
    User,
    UserRole,
)


def register_classes(oso):
    oso.register_class(
        AuthContext,
        fields={
            "user": User,
            "group": Group,
            "roles": list,
        },
    )
    oso.register_class(
        Group,
        fields={
            "id": int,
        },
    )

    oso.register_class(
        Role,
        fields={
            "id": int,
            "name": str,
        },
    )

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
        PhyloRun,
        fields={
            "id": int,
            "group": Relation(
                kind="one", other_type="Group", my_field="group_id", other_field="id"
            ),
        },
    )
    oso.register_class(
        Sample,
        fields={
            "id": int,
            "private": bool,
            "submitting_group": Relation(
                kind="one",
                other_type="Group",
                my_field="submitting_group_id",
                other_field="id",
            ),
        },
    )
    oso.register_class(
        PhyloTree,
        fields={
            "id": str,
            "phylo_run": Relation(
                kind="one",
                other_type="PhyloRun",
                my_field="producing_workflow_id",
                other_field="workflow_id",
            ),
        },
    )


async def get_read_session(
    request: Request,
    session: AsyncSession = Depends(get_db),
) -> AsyncOso:
    oso = AsyncOso()
    oso.set_data_filtering_adapter(AsyncSqlAlchemyAdapter(session))
    register_classes(oso)
    await oso.load_files(
        [Path.joinpath(Path(__file__).parent.absolute(), "policy.polar")]
    )
    return oso
