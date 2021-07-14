from .. import aspencli  # TODO, relative imports are dangerous.
from click.testing import CliRunner


def test_prod_config():
    conf = aspencli.CliConfig("prod", None)
    api_client = conf.get_api_client()
    token_handler = api_client.token_handler
    assert api_client.url == conf.api_urls["prod"]
    assert token_handler.verify == conf.oauth_config["prod"]["verify"]


def test_staging_config():
    conf = aspencli.CliConfig("staging", None)
    api_client = conf.get_api_client()
    token_handler = api_client.token_handler
    assert api_client.url == conf.api_urls["staging"]
    assert token_handler.verify == conf.oauth_config["default"]["verify"]
