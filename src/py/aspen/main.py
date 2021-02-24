# this is where flask finds the entry point for the application.

from aspen.app.app import application  # noqa: F401
from aspen.app.views.auth import callback_handling, login, logout  # noqa: F401
from aspen.app.views.base import serve  # noqa: F401
from aspen.app.views.sample import samples  # noqa: F401
from aspen.app.views.usergroup import usergroup  # noqa: F401
