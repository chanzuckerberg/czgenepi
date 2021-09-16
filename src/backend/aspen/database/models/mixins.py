import datetime
import enum
from typing import Any, Dict, List, NoReturn, Optional, Tuple, Type, TypeVar

import sqlalchemy as sa
from sqlalchemy import Column, Integer

from aspen.api.deps import get_db

TBase = TypeVar("TBase", bound="Base")

# a collection of mixin classes to help build the models
class Base:
    @classmethod
    def _get_query(
        cls,
        prefetch: Optional[Tuple[str, ...]] = None,
        options: Optional[List[Any]] = None,
    ) -> Any:
        query = sa.select(cls)
        if prefetch:
            if not options:
                options = []
            options.extend(selectinload(getattr(cls, x)) for x in prefetch)
            query = query.options(*options).execution_options(populate_existing=True)
        return query

    @classmethod
    async def all(
        cls: Type[TBase], prefetch: Optional[Tuple[str, ...]] = None
    ) -> List[TBase]:
        query = cls._get_query(prefetch)
        db = get_db()
        db_execute = await db.execute(query)
        return db_execute.scalars().all()

    @classmethod
    async def get_by_id(
        cls: Type[TBase], obj_id: int, prefetch: Optional[Tuple[str, ...]] = None
    ) -> Optional[TBase]:
        query = cls._get_query(prefetch).where(cls.id == obj_id)
        db = get_db()
        db_execute = await db.execute(query)
        instance = db_execute.scalars().first()
        return instance


# everyone needs an auto-generated primary key
class BaseMixin(Base):
    """Base model: all models have integer primary keys"""

    id = Column(Integer, primary_key=True, autoincrement=True)


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
