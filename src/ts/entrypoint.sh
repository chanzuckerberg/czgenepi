#!/bin/bash
set -e

if [ "$1" = 'server' -o $# -eq 0 ]; then
    # By default run the webserver
    exec npm start
fi

# None of the above cases, just run the command verbatim
exec "$@"
