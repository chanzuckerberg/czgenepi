from typing import Optional

from flask import Flask

from aspen.config.config import Config


class AspenApp(Flask):
    def __init__(self, *args, aspen_config: Optional[Config], **kwargs):
        super().__init__(*args, **kwargs)
        self._aspen_config = aspen_config
        if self._aspen_config is not None:
            self.config.from_object(self._aspen_config)

    def _inject_config(self, aspen_config: Config):
        self._aspen_config = aspen_config
        self.config.from_object(aspen_config)

    @property
    def aspen_config(self) -> Config:
        if self._aspen_config is None:
            raise ValueError("aspen config not set")
        return self._aspen_config
