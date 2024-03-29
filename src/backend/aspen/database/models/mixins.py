import datetime
import enum
from typing import Any, List, Optional, Tuple, Type, TypeVar

import sqlalchemy as sa
from sqlalchemy import Column, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import declarative_mixin, selectinload  # type: ignore

TBase = TypeVar("TBase", bound="Base")
TIDBase = TypeVar("TIDBase", bound="BaseMixin")


# a collection of mixin classes to help build the models

# TODO fix type hints for sa query.
@declarative_mixin  # type: ignore
class Base:
    @classmethod
    def _get_query(
        cls,
        prefetch: Optional[Tuple[str, ...]] = None,
        options: Optional[List[Any]] = None,
    ) -> Any:
        query = sa.select(cls)  # type: ignore
        if prefetch:
            if not options:
                options = []
            options.extend(selectinload(getattr(cls, x)) for x in prefetch)
            query = query.options(*options).execution_options(populate_existing=True)  # type: ignore
        return query

    @classmethod
    async def all(
        cls: Type[TBase], db: AsyncSession, prefetch: Optional[Tuple[str, ...]] = None
    ) -> List[TBase]:
        query = cls._get_query(prefetch)
        db_execute = await db.execute(query)
        return db_execute.scalars().all()


# everyone needs an auto-generated primary key
class BaseMixin(Base):
    """Base model: all models have integer primary keys"""

    id = Column(Integer, primary_key=True, autoincrement=True)

    @classmethod
    async def get_by_id(
        cls: Type[TIDBase],
        db: AsyncSession,
        obj_id: int,
        prefetch: Optional[Tuple[str, ...]] = None,
    ) -> Optional[TIDBase]:
        query = cls._get_query(prefetch).where(cls.id == obj_id)
        db_execute = await db.execute(query)
        instance = db_execute.scalars().first()
        return instance


class DictMixin(Base):
    def to_dict(self):
        d = {}
        for column in self.__table__.columns:
            column_value = getattr(self, column.name)
            if isinstance(column_value, (datetime.datetime, datetime.date)):
                d[column.name] = column_value.isoformat()

            else:
                if isinstance(column_value, enum.Enum):
                    d[column.name] = column_value.value
                else:
                    d[column.name] = column_value

        return d
