from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from aspen.api.auth import get_admin_user, get_auth_user, get_usergroup_query
from aspen.api.deps import get_db
from aspen.database.models import User
from aspen.error import http_exceptions as ex

router = APIRouter()

