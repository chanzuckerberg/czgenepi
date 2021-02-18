import datetime

from sqlalchemy import Column, Integer

# a collection of mixin classes to help build the models


# everyone needs an auto-generated primary key
class BaseMixin:
    """Base model: all models have integer primary keys"""

    id = Column(Integer, primary_key=True, autoincrement=True)


class DictMixin:
    def to_dict(self):
        d = {}
        for column in self.__table__.columns:
            if isinstance(
                getattr(self, column.name), (datetime.datetime, datetime.date)
            ):
                d[column.name] = getattr(self, column.name).isoformat()

            else:
                d[column.name] = getattr(self, column.name)

        return d
