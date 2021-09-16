from typing import List, Optional

from pydantic import PositiveInt

from aspen.api.schemas.base import Base


class Health(Base):
    healthy: bool = None
