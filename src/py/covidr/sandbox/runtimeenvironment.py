from __future__ import annotations

from enum import Enum
from typing import MutableMapping

_reverse_map: MutableMapping[str, RuntimeEnvironment] = dict()


class RuntimeEnvironment(Enum):
    PROD = ("prod", True)
    STAGING = ("staging", True)
    LOCAL = ("local", False)

    def __init__(self, name: str, has_readonly: bool):
        self._name = name
        self.has_readonly = has_readonly
        _reverse_map[name] = self

    @classmethod
    def by_name(cls, name: str) -> RuntimeEnvironment:
        return _reverse_map[name]
