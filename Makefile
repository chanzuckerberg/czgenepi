SHELL := /bin/bash
PYTHON_CODE_DIRECTORIES = src/py


### DATABASE #################################################
#

LOCAL_DB_CONTAINER_NAME = covidr-local
LOCAL_DB_CONTAINER_ID = $(shell docker ps -a | grep $(LOCAL_DB_CONTAINER_NAME) | awk '{print $$1}')
LOCAL_DB_CONTAINER_RUNNING_ID = $(shell docker ps | grep $(LOCAL_DB_CONTAINER_NAME) | awk '{print $$1}')
LOCAL_DB_NAME = covidr_db
LOCAL_DB_ADMIN_USERNAME = postgres  # This has to be "postgres" to ease moving snapshots from RDS.
LOCAL_DB_ADMIN_PASSWORD = admin
LOCAL_DB_RW_USERNAME = user_rw
LOCAL_DB_RW_PASSWORD = password_rw
LOCAL_DB_RO_USERNAME = user_ro
LOCAL_DB_RO_PASSWORD = password_ro
DOCKER_IMAGE = czbiohub/covidhub-postgres:11.5-alpine

start-local-db:
	@if [ "$(LOCAL_DB_CONTAINER_ID)" == "" ]; then \
		docker create --name $(LOCAL_DB_CONTAINER_NAME) -p 5432:5432 \
		-e POSTGRES_USER=$(LOCAL_DB_ADMIN_USERNAME) \
		-e POSTGRES_PASSWORD=$(LOCAL_DB_ADMIN_PASSWORD) \
		-e POSTGRES_DB=$(LOCAL_DB_NAME) \
		$(DOCKER_IMAGE); \
	fi
	@if [ "$(LOCAL_DB_CONTAINER_RUNNING_ID)" == "" ]; then \
		docker start $(LOCAL_DB_CONTAINER_NAME) && sleep 3; \
	fi

setup-local-db:
	@$(MAKE) start-local-db
	@docker exec $(LOCAL_DB_CONTAINER_NAME) psql -h localhost -d $(LOCAL_DB_NAME) -U $(LOCAL_DB_ADMIN_USERNAME) -c "CREATE USER $(LOCAL_DB_RW_USERNAME) WITH PASSWORD '$(LOCAL_DB_RW_PASSWORD)';"
	@docker exec $(LOCAL_DB_CONTAINER_NAME) psql -h localhost -d $(LOCAL_DB_NAME) -U $(LOCAL_DB_ADMIN_USERNAME) -c "CREATE USER $(LOCAL_DB_RO_USERNAME) WITH PASSWORD '$(LOCAL_DB_RO_PASSWORD)';"
	@docker exec $(LOCAL_DB_CONTAINER_NAME) psql -h localhost -d $(LOCAL_DB_NAME) -U $(LOCAL_DB_ADMIN_USERNAME) -c "GRANT CREATE ON DATABASE $(LOCAL_DB_NAME) TO $(LOCAL_DB_RW_USERNAME);"

init-local-db:
	@$(MAKE) setup-local-db
	covidr-cli db create
	ENV=dev alembic stamp head

stop-local-db:
	@if [ "$(LOCAL_DB_CONTAINER_RUNNING_ID)" != "" ]; then \
		docker stop $(LOCAL_DB_CONTAINER_NAME); \
	fi

drop-local-db:
	@$(MAKE) stop-local-db
	@( read -p "Delete local database container? [y/N]: " sure && case "$$sure" in [yY]) true;; *) false;; esac )
	docker rm --force $(LOCAL_DB_CONTAINER_NAME) || true

.PHONY: start-local-db setup-local-db init-local-db stop-local-db drop-local-db

#
##############################################################

### STYLE CHECKS #############################################
#

style: lint black isort mypy

lint:
	flake8 --ignore "E203, E231, E501, W503" $(PYTHON_CODE_DIRECTORIES)

black:
	black --check $(PYTHON_CODE_DIRECTORIES)

isort:
	isort --check $(PYTHON_CODE_DIRECTORIES)

mypy:
	mypy --ignore-missing-imports $(PYTHON_CODE_DIRECTORIES)

.PHONY: style lint black isort

#
##############################################################

### REQUIREMENTS #############################################
#

GENERATED_REQUIREMENT_FILES=src/py/requirements.txt src/py/requirements-dev.txt
SOURCE_REQUIREMENT_FILES=src/py/requirements.txt.in src/py/requirements-dev.txt.in

# This rule pins the requirements with the minimal set of changes required to satisfy the
# requirements.  This is typically run when a new requirement is added, and we want to
# propagate the new requirement to the pin files.
pin-requirements : $(GENERATED_REQUIREMENT_FILES)

# This rule removes all existing pins and pins all requirements based on the latest set of libraries
# that satisfy the requirements.  This is typically run periodically to make sure the pins don't
# become too stale.
pin-all-requirements:
	@for target in $(GENERATED_REQUIREMENT_FILES); do \
		echo -n '' >| $$target; \
	done
	@if [ $$(uname -s) == "Darwin" ]; then sleep 1; fi  # this is require because Darwin HFS+ only has second-resolution for timestamps.
	@touch $(SOURCE_REQUIREMENT_FILES)
	$(MAKE) $(GENERATED_REQUIREMENT_FILES)

src/py/require%.txt : src/py/require%.txt.in src/py/requirements.txt.in
	[ ! -e .$$(basename "$<")-env ] || exit 1
	python -m venv .$$(basename "$<")-env
	.$$(basename "$<")-env/bin/pip install -r $@
	for src in $^; do \
		.$$(basename "$<")-env/bin/pip install -r $$src; \
	done
	echo "# You should not edit this file directly.  Instead, you should edit one of the following files ($^) and run make $@" >| $@
	.$$(basename "$<")-env/bin/pip freeze >> $@
	rm -rf .$$(basename "$<")-env

check-requirements:
	if [[ $$(git status --porcelain $(GENERATED_REQUIREMENT_FILES)) ]]; then \
	    echo "Modifications found in REQUIREMENTS files"; exit 2; \
	fi

help-requirements:
	$(call print_help, pin-requirements, pin requirements with minimal set of changes)
	$(call print_help, pin-all-requirements, pin requirements with latest packages)
	$(call print_help, check-requirements, fail if requirements files have been modified)

.PHONY: pin-requirements pin-all-requirements check-requirements
#
##############################################################
