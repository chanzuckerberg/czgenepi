from os import fspath
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_single_head(postgres_database):
    """Test that we have a single head for the schema migrations."""
    root = Path(__file__).parent.parent.parent.parent
    alembic_cfg = Config(fspath(root / "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", postgres_database.as_uri())
    script = ScriptDirectory.from_config(alembic_cfg)
    heads = script.get_revisions(script.get_heads())
    assert len(heads) == 1
