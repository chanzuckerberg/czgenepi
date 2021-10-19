import time

import requests
from auth0.v3.authentication.token_verifier import (
    AsymmetricSignatureVerifier,
    JwksFetcher,
    TokenVerifier,
)
from auth0.v3.exceptions import TokenValidationError


class InsecureJwksFetcher(JwksFetcher):
    def _fetch_jwks(self, force=False):
        has_expired = self._cache_date + self._cache_ttl < time.time()

        if not force and not has_expired:
            # Return from cache
            self._cache_is_fresh = False
            return self._cache_value

        # Invalidate cache and fetch fresh data
        self._cache_value = {}
        response = requests.get(self._jwks_url, verify=False)

        if response.ok:
            # Update cache
            jwks = response.json()
            self._cache_value = self._parse_jwks(jwks)
            self._cache_is_fresh = True
            self._cache_date = time.time()
        return self._cache_value


def validate_auth_header(auth_header, domain, client_id):
    parts = auth_header.split()

    if parts[0].lower() != "bearer":
        raise TokenValidationError("Authorization header must start with Bearer")
    elif len(parts) == 1:
        raise TokenValidationError("Token not found")
    elif len(parts) > 2:
        raise TokenValidationError("Authorization header must be Bearer token")

    id_token = parts[1]

    # TODO, this should probably be a part of aspen config.
    if "genepinet.localdev" in domain:
        jwks_url = f"https://{domain}/.well-known/openid-configuration/jwks"
        issuer = f"https://{domain}"
        # Adapted from https://github.com/auth0/auth0-python#id-token-validation
        sv = AsymmetricSignatureVerifier(jwks_url)
        sv._fetcher = InsecureJwksFetcher(jwks_url)
    else:
        jwks_url = f"https://{domain}/.well-known/jwks.json"
        issuer = f"https://{domain}/"
        sv = AsymmetricSignatureVerifier(jwks_url)

    payload = sv.verify_signature(id_token)
    tv = TokenVerifier(signature_verifier=sv, issuer=issuer, audience=client_id)
    tv._verify_payload(payload)
    return payload
