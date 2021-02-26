try:
    import covidhub  # noqa: F401
except ImportError:
    ...
else:
    from .implementation import import_project  # noqa: F401
