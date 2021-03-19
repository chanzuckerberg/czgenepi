SHELL := /bin/bash
PYTHON_CODE_DIRECTORIES = src/py
SKIP_PYTHON_STYLE_DIRECTORIES = src/py/third-party

### DOCKER #################################################
#
export DOCKER_BUILDKIT:=1
export COMPOSE_DOCKER_CLI_BUILD:=1
export COMPOSE_OPTS:=--env .env.ecr
export AWS_DEV_PROFILE=genepi-dev
export BACKEND_APP_ROOT=/usr/src/app

### DATABASE #################################################
#

LOCAL_DB_CONTAINER_NAME = aspen-local
LOCAL_DB_CONTAINER_ID = $(shell docker ps -a | grep $(LOCAL_DB_CONTAINER_NAME) | awk '{print $$1}')
LOCAL_DB_CONTAINER_RUNNING_ID = $(shell docker ps | grep $(LOCAL_DB_CONTAINER_NAME) | awk '{print $$1}')
LOCAL_DB_NAME = aspen_db
LOCAL_DB_ADMIN_USERNAME = postgres  # This has to be "postgres" to ease moving snapshots from RDS.
LOCAL_DB_ADMIN_PASSWORD = password_postgres
LOCAL_DB_RW_USERNAME = user_rw
LOCAL_DB_RW_PASSWORD = password_rw
LOCAL_DB_RO_USERNAME = user_ro
LOCAL_DB_RO_PASSWORD = password_ro
DOCKER_IMAGE = czbiohub/covidhub-postgres:13.1-alpine

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
	aspen-cli db create
	DB=local alembic stamp head

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
	black --check $(PYTHON_CODE_DIRECTORIES) --exclude $(SKIP_PYTHON_STYLE_DIRECTORIES)

isort:
	isort --check $(PYTHON_CODE_DIRECTORIES) $(ls -d src/py/*/ | grep -v third-party)

mypy:
	mypy --ignore-missing-imports $(PYTHON_CODE_DIRECTORIES)

.PHONY: style lint black isort

#
##############################################################

### REQUIREMENTS #############################################
#

update-deps :
	pipenv update
	pipenv lock -r >| src/py/requirements.txt

.PHONY: update-deps

#
##############################################################

### TESTTING #############################################
#

unit-tests:
	pytest -n8 src/py/aspen

#
##############################################################
### Docker local dev #########################################
#
oauth/pkcs12/certificate.pfx:
	# All calls to the openssl cli happen in the oidc-server-mock container.
	@echo "Generating certificates for local dev"
	docker run -v $(PWD)/oauth/pkcs12:/tmp/certs --workdir /tmp/certs --rm=true --entrypoint bash soluto/oidc-server-mock:0.3.0 ./generate_cert.sh
	@if [ "$$(uname -s)" == "Darwin" ]; then \
		echo "Installing generated certs into the local keychain requires sudo access:"; \
		sudo security add-trusted-cert -d -p ssl -k /Library/Keychains/System.keychain oauth/pkcs12/server.crt; \
	fi
	# Linux assumes Ubuntu
	if [ "$$(uname -s)" == "Linux" ]; then \
		sudo cp oauth/pkcs12/server.crt /usr/local/share/ca-certificates/; \
		sudo update-ca-certificates; \
	fi
	docker run -v $(PWD)/oauth/pkcs12:/tmp/certs --workdir /tmp/certs --rm=true --entrypoint bash soluto/oidc-server-mock:0.3.0 ./generate_pfx.sh
	# On Linux, the pkcs12 directory gets written to with root permission. Force ownership to our user.
	sudo chown -R $$(id -u):$$(id -g) $(PWD)/oauth/pkcs12

.env.ecr:
	echo DOCKER_REPO=$$(aws sts get-caller-identity --profile $(AWS_DEV_PROFILE) | jq -r .Account).dkr.ecr.us-west-2.amazonaws.com/ > .env.ecr;

.PHONY: local-ecr-login
local-ecr-login:
	if PROFILE=$$(aws configure list-profiles | grep $(AWS_DEV_PROFILE)); then \
		aws ecr get-login-password --region us-west-2 --profile $(AWS_DEV_PROFILE) | docker login --username AWS --password-stdin $$(aws sts get-caller-identity --profile $(AWS_DEV_PROFILE) | jq -r .Account).dkr.ecr.us-west-2.amazonaws.com; \
	fi

.PHONY: local-init
local-init: oauth/pkcs12/certificate.pfx .env.ecr local-ecr-login ## Launch a new local dev env and populate it with test data.
	docker-compose $(COMPOSE_OPTS) up -d
	docker-compose exec -T utility pip3 install awscli
	docker-compose exec -T utility $(BACKEND_APP_ROOT)/scripts/setup_dev_data.sh
	docker-compose exec -T utility python scripts/setup_localdata.py
	docker-compose exec -T utility pip install .
	-@docker-compose exec -e PGPASSWORD=$(LOCAL_DB_RW_PASSWORD) database psql -h localhost -d $(LOCAL_DB_NAME) -U $(LOCAL_DB_RW_USERNAME) -c "CREATE USER $(LOCAL_DB_RO_USERNAME) WITH PASSWORD '$(LOCAL_DB_RO_PASSWORD)';"
	docker-compose exec -T utility aspen-cli db --docker create
	docker-compose exec -T utility alembic stamp head

.PHONY: local-status
local-status: ## Show the status of the containers in the dev environment.
	docker ps -a | grep --color=no -e 'CONTAINER\|aspen'

.PHONY: local-rebuild
local-rebuild: .env.ecr local-ecr-login ## Rebuild local dev without re-importing data
	docker-compose $(COMPOSE_OPTS) build frontend backend
	docker-compose $(COMPOSE_OPTS) up -d frontend backend database oidc localstack

.PHONY: local-sync
local-sync: local-rebuild local-init ## Re-sync the local-environment state after modifying library deps or docker configs

.PHONY: local-start
local-start: .env.ecr ## Start a local dev environment that's been stopped.
	docker-compose $(COMPOSE_OPTS) up -d

.PHONY: local-stop
local-stop: ## Stop the local dev environment.
	docker-compose stop

.PHONY: local-clean
local-clean: ## Remove everything related to the local dev environment (including db data!)
	-if [ -f ./oauth/pkcs12/server.crt ] ; then \
	    export CERT=$$(docker run -v $(PWD)/oauth/pkcs12:/tmp/certs --workdir /tmp/certs --rm=true --entrypoint "" soluto/oidc-server-mock:0.3.0 bash -c "openssl x509 -in server.crt -outform DER | sha1sum | cut -d ' ' -f 1"); \
	    echo ""; \
	    echo "Removing this certificate requires sudo access"; \
	    sudo security delete-certificate -Z $${CERT} /Library/Keychains/System.keychain; \
	fi;
	-rm -rf ./oauth/pkcs12/server*
	-rm -rf ./oauth/pkcs12/certificate*
	docker-compose rm -sf
	-docker volume rm aspen_database
	-docker volume rm aspen_localstack

.PHONY: local-logs
local-logs: ## Tail the logs of the dev env containers. ex: make local-logs CONTAINER=backend
	docker-compose logs -f $(CONTAINER)

.PHONY: local-shell
local-shell: ## Open a command shell in one of the dev containers. ex: make local-shell CONTAINER=frontend
	docker-compose exec $(CONTAINER) bash

.PHONY: local-pgconsole
local-pgconsole: ## Connect to the local postgres database.
	psql "postgresql://$(LOCAL_DB_RW_USERNAME):$(LOCAL_DB_RW_PASSWORD)@localhost:5432/$(LOCAL_DB_NAME)"

.PHONY: local-dbconsole
local-dbconsole: ## Connect to the local postgres database.
	docker-compose exec utility aspen-cli db --docker interact

.PHONY: local-update-deps
local-update-deps :
	docker-compose exec utility pipenv update
	docker-compose exec utility pipenv lock -r >| src/py/requirements.txt
