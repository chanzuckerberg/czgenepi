from sqlalchemy import MetaData
from sqlalchemy.orm import registry

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

mapper_registry = registry(metadata=meta)
base = mapper_registry.generate_base()
idbase = mapper_registry.generate_base(cls=mx.BaseMixin)
