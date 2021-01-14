from sqlalchemy import Column, Integer, String

# a collection of mixin classes to help build the modelss


# everyone needs an auto-generated primary key
class BaseMixin:
    """Base model: all models have integer primary keys"""

    id = Column(Integer, primary_key=True, autoincrement=True)


# for things that have names
class NameMixin:
    """Mixin that adds a required unique name string field"""

    name = Column(String, unique=True, nullable=False)

    def __repr__(self):
        return self.name
