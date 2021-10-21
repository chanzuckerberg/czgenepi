import asyncio
import os
import signal
import sys
import threading
import time
from typing import Any

from uvicorn.workers import UvicornWorker


# Code from https://github.com/encode/uvicorn/pull/1193/files
class ReloaderThread(threading.Thread):
    def __init__(self, worker: "AspenUvicornWorker", sleep_interval: float = 1.0):
        super().__init__()
        self.setDaemon(True)
        self._worker = worker
        self._interval = sleep_interval

    def run(self) -> None:
        while True:
            if not self._worker.alive:
                os.kill(os.getpid(), signal.SIGINT)
            time.sleep(self._interval)


class AspenUvicornWorker(UvicornWorker):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._reloader_thread = ReloaderThread(self)

    def run(self) -> None:
        if self.cfg.reload:
            self._reloader_thread.start()

        if sys.version_info >= (3, 7):
            return asyncio.run(self._serve())
        return asyncio.get_event_loop().run_until_complete(self._serve())
