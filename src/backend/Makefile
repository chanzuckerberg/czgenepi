STYLE_CHECK_PYTHON_CODE_DIRECTORIES = .
STYLE_CHECK_PYTHON_CODE_SKIPPED_DIRECTORIES = third-party
TYPE_CHECK_BASE_PYTHON_CODE_DIRECTORIES = aspen


### CHECK STYLE #############################################
check-style: lint black isort mypy

lint:
	flake8 --ignore "E203, E231, E501, W503" $(STYLE_CHECK_PYTHON_CODE_DIRECTORIES) --exclude third-party

black:
	black --check $(STYLE_CHECK_PYTHON_CODE_DIRECTORIES) --exclude $(STYLE_CHECK_PYTHON_CODE_SKIPPED_DIRECTORIES)

isort:
	isort --profile black --check $(STYLE_CHECK_PYTHON_CODE_DIRECTORIES) --skip $(STYLE_CHECK_PYTHON_CODE_SKIPPED_DIRECTORIES) 

mypy:
	mypy --ignore-missing-imports aspen
	mypy --ignore-missing-imports database_migrations


### RUN STYLE #############################################
run-style: run-autoflake run-black run-isort

run-black:
	black $(STYLE_CHECK_PYTHON_CODE_DIRECTORIES) --exclude $(STYLE_CHECK_PYTHON_CODE_SKIPPED_DIRECTORIES)

run-isort:
	isort --profile black $(STYLE_CHECK_PYTHON_CODE_DIRECTORIES) --skip $(STYLE_CHECK_PYTHON_CODE_SKIPPED_DIRECTORIES) 

run-autoflake:
	autoflake -v -i --ignore-init-module-imports --remove-all-unused-imports --remove-unused-variables -r $(TYPE_CHECK_BASE_PYTHON_CODE_DIRECTORIES)


### TESTING #############################################
test: # run pytest
	pytest -n8 aspen

### ALEMBIC #############################################
alembic-upgrade-head:
	alembic upgrade head # applies to local only

alembic-undo-migration:
	alembic downgrade -1

alembic-autogenerate:
	alembic revision --autogenerate -m "$(MESSAGE)" --rev-id $$(date +%Y%m%d_%H%M%S)

.PHONY: remote-db-migrations
remote-db-migrations:
	if [ ! -z "${DATA_LOAD_PATH}" ]; then \
		apt-get update; \
		apt-get install -y postgresql-client; \
		aspen-cli db --remote setup; \
	fi
	DB=remote alembic upgrade head

.PHONY: remote-db-drop
remote-db-drop:
	aspen-cli db --remote drop
