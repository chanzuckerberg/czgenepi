import hashlib
from typing import Any, Mapping, Union

from flask.json.tag import TaggedJSONSerializer
from itsdangerous import URLSafeTimedSerializer
from itsdangerous.exc import BadSignature
from starlette.datastructures import MutableHeaders
from starlette.requests import HTTPConnection
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class SessionMiddleware:
    def __init__(
        self,
        app: ASGIApp,
        secret_key: str,
        session_cookie: str = "session",
        max_age: int = 14 * 24 * 60 * 60,  # 14 days, in seconds
        same_site: str = "lax",
        https_only: bool = False,
    ) -> None:
        self.app = app
        signer_kwargs = dict(key_derivation="hmac", digest_method=hashlib.sha1)
        self.signer = URLSafeTimedSerializer(
            secret_key,
            salt="cookie-session",
            serializer=TaggedJSONSerializer(),
            signer_kwargs=signer_kwargs,
        )
        self.session_cookie = session_cookie
        self.max_age = max_age
        self.security_flags = "httponly; samesite=" + same_site
        if https_only:  # Secure flag can be used with HTTPS only
            self.security_flags += "; secure"

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] not in ("http", "websocket"):  # pragma: no cover
            await self.app(scope, receive, send)
            return

        connection = HTTPConnection(scope)
        initial_session_was_empty = True

        if self.session_cookie in connection.cookies:
            data = connection.cookies[self.session_cookie].encode("utf-8")
            try:
                scope["session"] = self.decode_flask_cookie(data)
                initial_session_was_empty = False
            except BadSignature:
                scope["session"] = {}
        else:
            scope["session"] = {}

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                path = scope.get("root_path", "") or "/"
                if scope["session"]:
                    # We have session data to persist.
                    data = self.encode_flask_cookie(scope["session"])
                    headers = MutableHeaders(scope=message)
                    header_value = f"{self.session_cookie}={data}; path={path}; Max-Age={self.max_age}; {self.security_flags}"  # type: ignore
                    headers.append("Set-Cookie", header_value)
                elif not initial_session_was_empty:
                    # The session has been cleared.
                    headers = MutableHeaders(scope=message)
                    header_value = f"{self.session_cookie}=null; path={path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; {self.security_flags}"
                    headers.append("Set-Cookie", header_value)
            await send(message)

        await self.app(scope, receive, send_wrapper)

    def encode_flask_cookie(self, data: Mapping[str, Any]) -> Union[str, bytes]:
        return self.signer.dumps(data)

    def decode_flask_cookie(self, cookie_text: Union[str, bytes]) -> Mapping[str, Any]:
        return self.signer.loads(cookie_text)
