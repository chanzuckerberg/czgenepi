import datetime
from typing import Optional


def format_date(dt: Optional[datetime.date], format="%Y-%m-%d") -> Optional[str]:
    if dt is not None:
        return dt.strftime(format)
    else:
        return None


def format_datetime(
    dt: Optional[datetime.datetime], format="%Y-%m-%d %I:%M%p"
) -> Optional[str]:
    if dt is not None:
        return dt.strftime(format)
    else:
        return None
