SHELL := /bin/bash

.PHONY: init-db-cli
init-db-cli:
	pip install .

.PHONY: db-migrations
db-migrations:
	if [ ! -z "${DATA_LOAD_PATH}" ]; then \
		aspen-cli db --remote create --sql-file ${DATA_LOAD_PATH}; \
	fi
	alembic upgrade head

.PHONY: db-drop:
db-drop:
	aspen-cli db --remote drop
