from sqlalchemy import MetaData
from sqlalchemy.ext.declarative import declarative_base

from aspen.database.models import mixins as mx

meta = MetaData(
    schema="aspen",
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_N_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    },
)

base = declarative_base(metadata=meta)
idbase = declarative_base(cls=mx.BaseMixin, metadata=meta)
