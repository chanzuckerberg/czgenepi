from __future__ import annotations

from collections import MutableMapping
from typing import Type


class Config:
    _subclasses: MutableMapping[str, Type[Config]] = dict()

    def __init_subclass__(cls: Type[Config], descriptive_name: str, *args, **kwargs):
        # the type: ignore on the next line is due to
        # https://github.com/python/mypy/issues/4660
        super().__init_subclass__(*args, **kwargs)  # type: ignore
        Config._subclasses[descriptive_name] = cls

    @classmethod
    def by_descriptive_name(cls, descriptive_name: str) -> Config:
        return Config._subclasses[descriptive_name]()

    @property
    def DEBUG(self):
        return False

    @property
    def TESTING(self):
        return False

    @property
    def DATABASE_URI(self):
        raise NotImplementedError()

    @property
    def DATABASE_READONLY_URI(self):
        raise NotImplementedError()
