import json
import logging
import multiprocessing
import os
import sys

logging.basicConfig(
    level=logging.INFO,
    format="flask [%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s",
    datefmt="%d/%b/%Y %H:%M:%S",
    stream=sys.stdout,
)

# Gunicorn config variables
loglevel = os.getenv("LOG_LEVEL", "info")
workers = os.getenv("WORKERS", 4)
bind = "unix:///var/run/gunicorn.sock"
errorlog = "-"
worker_tmp_dir = "/dev/shm"
accesslog = "-"
graceful_timeout = int(os.getenv("GRACEFUL_TIMEOUT", "120"))
timeout = int(os.getenv("TIMEOUT", "120"))
keepalive = int(os.getenv("KEEP_ALIVE", "5"))
access_log_format = 'flask %(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# For debugging and testing
log_data = {
    "loglevel": loglevel,
    "access_log_format": access_log_format,
    "workers": workers,
    "bind": bind,
    "graceful_timeout": graceful_timeout,
    "timeout": timeout,
    "keepalive": keepalive,
    "errorlog": errorlog,
    "accesslog": accesslog,
}
