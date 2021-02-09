from sqlalchemy import Column, Integer

# a collection of mixin classes to help build the models


# everyone needs an auto-generated primary key
class BaseMixin:
    """Base model: all models have integer primary keys"""

    id = Column(Integer, primary_key=True, autoincrement=True)
