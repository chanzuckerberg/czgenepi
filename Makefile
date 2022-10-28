SHELL := /bin/bash

### DOCKER ENVIRONMENTAL VARS #################################################
export DOCKER_BUILDKIT:=1
export COMPOSE_DOCKER_CLI_BUILD:=1
export docker_compose:=docker compose --env-file .env.ecr
export AWS_DEV_PROFILE=genepi-dev
export AWS_PROD_PROFILE=genepi-prod
export BACKEND_APP_ROOT=/usr/src/app

### DATABASE VARIABLES #################################################
DB_SEARCH_PATH=aspen,public
LOCAL_DB_NAME = aspen_db
LOCAL_DB_SERVER = localhost:5432
# This has to be "postgres" to ease moving snapshots from RDS.
LOCAL_DB_ADMIN_USERNAME = postgres
LOCAL_DB_ADMIN_PASSWORD = password_postgres
LOCAL_DB_RW_USERNAME = user_rw
LOCAL_DB_RW_PASSWORD = password_rw
LOCAL_DB_RO_USERNAME = user_ro
LOCAL_DB_RO_PASSWORD = password_ro
LOCALDEV_PROFILE ?= web
LOCAL_DB_CONN_STRING = postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)

### HELPFUL #################################################
help: ## display help for this makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.PHONY: help

.PHONY: rm-pycache
rm-pycache: ## remove all __pycache__ files (run if encountering issues with pycharm debugger (containers exiting prematurely))
	find . -name '__pycache__' | xargs rm -rf

### Connecting to remote dbs #########################################
remote-pgconsole: # Get a psql console on a remote db (from OSX only!)
	export ENV=$${ENV:=rdev}; \
	export AWS_PROFILE=$(shell [ $(ENV) = prod ] && echo $(AWS_PROD_PROFILE) || echo $(AWS_DEV_PROFILE)); \
	export HAPPY_ENV=$(shell [ $(ENV) != rdev ] && echo ge$(ENV) || echo dev); \
	export config=$$(aws secretsmanager get-secret-value --secret-id $${HAPPY_ENV}/genepi-config | jq -r .SecretString ); \
	export DB_URI=$$(jq -r '"postgresql://\(.DB_admin_username):\(.DB_admin_password)@127.0.0.1:5556/$(DB)"' <<< $$config); \
	echo Connecting to $$(jq -r .DB_address <<< $$config)/$(DB) via $$(jq -r .bastion_host <<< $$config); \
	ssh -f -o ExitOnForwardFailure=yes -L 5556:$$(jq -r .DB_address <<< $$config):5432 $$(jq -r .bastion_host <<< $$config) sleep 10; \
	psql $${DB_URI}?options=--search_path%3d$(DB_SEARCH_PATH)

remote-dbconsole: .env.ecr # Get a python console on a remote db (from OSX only!)
	export ENV=$${ENV:=rdev}; \
	export AWS_PROFILE=$(shell [ $(ENV) = prod ] && echo $(AWS_PROD_PROFILE) || echo $(AWS_DEV_PROFILE)); \
	export HAPPY_ENV=$(shell [ $(ENV) != rdev ] && echo ge$(ENV) || echo dev); \
	export config=$$(aws secretsmanager get-secret-value --secret-id $${HAPPY_ENV}/genepi-config | jq -r .SecretString ); \
	export OSX_IP=$$(ipconfig getifaddr en0 || ipconfig getifaddr en1); \
	export DB_URI=$$(jq -r '"postgresql://\(.DB_admin_username):\(.DB_admin_password)@'$${OSX_IP}':5555/$(DB)"' <<< $$config); \
	echo Connecting to $$(jq -r .DB_address <<< $$config)/$(DB) via $$(jq -r .bastion_host <<< $$config); \
	ssh -f -o ExitOnForwardFailure=yes -L $${OSX_IP}:5555:$$(jq -r .DB_address <<< $$config):5432 $$(jq -r .bastion_host <<< $$config) sleep 20; \
	$(docker_compose) run -e DB_URI backend sh -c 'aspen-cli db --remote interact --connect'

### DOCKER LOCAL DEV #########################################
.PHONY: local-hostconfig
local-hostconfig:
	sudo happy hosts install

.PHONY: local-nohostconfig
local-nohostconfig:
	sudo happy hosts uninstall

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
	# If the OIDC server is already running, restart it to use the new certs
	if [ -n "$$(docker ps -q -f name=oidc)" ]; then \
		echo "Restarting OIDC server"; \
		$(docker_compose) restart oidc; \
	fi

.env.ecr:
	export AWS_ACCOUNT_ID=$$(aws sts get-caller-identity --profile $(AWS_DEV_PROFILE) | jq -r .Account); \
	if [ -n "$${AWS_ACCOUNT_ID}" ]; then \
		echo DOCKER_REPO=$${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com/ > .env.ecr; \
	else \
		false; \
	fi

.PHONY: local-ecr-login
local-ecr-login:
	if PROFILE=$$(aws configure list-profiles | grep $(AWS_DEV_PROFILE)); then \
		aws ecr get-login-password --region us-west-2 --profile $(AWS_DEV_PROFILE) | docker login --username AWS --password-stdin $$(aws sts get-caller-identity --profile $(AWS_DEV_PROFILE) | jq -r .Account).dkr.ecr.us-west-2.amazonaws.com; \
	fi

.PHONY: init-empty-db
init-empty-db:
	$(docker_compose) stop database
	$(docker_compose) rm database
	$(docker_compose) --profile $(LOCALDEV_PROFILE) -f docker-compose.yml -f docker-compose-emptydb.yml up -d
	sleep 10 # hack, let postgres start up cleanly.
	-$(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c "ALTER USER $(LOCAL_DB_ADMIN_USERNAME) WITH PASSWORD '$(LOCAL_DB_ADMIN_PASSWORD)';"
	-$(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c "CREATE USER $(LOCAL_DB_RW_USERNAME) WITH PASSWORD '$(LOCAL_DB_RW_PASSWORD)';"
	-$(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c "CREATE USER $(LOCAL_DB_RO_USERNAME) WITH PASSWORD '$(LOCAL_DB_RO_PASSWORD)';"
	-$(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c "GRANT ALL PRIVILEGES ON DATABASE $(LOCAL_DB_NAME) TO $(LOCAL_DB_RW_USERNAME);"
	$(docker_compose) run sh -c 'aspen-cli db --local create; alembic stamp head'


.PHONY: local-init
local-init: oauth/pkcs12/certificate.pfx .env.ecr local-ecr-login local-hostconfig ## Launch a new local dev env and populate it with test data.
	$(docker_compose) pull database
	$(docker_compose) --profile $(LOCALDEV_PROFILE) up -d
	# Wait for psql to be up
	while [ -z "$$($(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c 'select 1')" ]; do echo "waiting for db to start..."; sleep 1; done;
	@$(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c "alter user $(LOCAL_DB_ADMIN_USERNAME) with password '$(LOCAL_DB_ADMIN_PASSWORD)';"
	# Hack - CI keeps recreating localstack for some reason :'(
	$(docker_compose) --profile $(LOCALDEV_PROFILE) up -d
	./scripts/setup_dev_data.sh
	$(docker_compose) restart backend
	$(docker_compose) exec -T backend alembic upgrade head
	$(docker_compose) exec -T backend python scripts/setup_localdata.py
	$(docker_compose) --profile $(LOCALDEV_PROFILE) up -d

# Assumes you've already run `make local-init` to configure localstack resources!
.PHONY: prepare-new-db-snapshot
prepare-new-db-snapshot: local-start
	$(docker_compose) rm -f database # Wipe out the additional dev rows that `make local-init` adds
	$(docker_compose) pull database
	$(docker_compose) up -d database
	# Wait for psql to be up
	while [ -z "$$($(docker_compose) exec -T database psql $(LOCAL_DB_CONN_STRING) -c 'select 1')" ]; do echo "waiting for db to start..."; sleep 1; done;
	$(docker_compose) exec -T backend alembic upgrade head
	@echo
	@echo "Ok, local db is prepared and ready to go -- make any additional changes you need to and then run:"
	@echo "make create_new_db_image"

.PHONY: create-new-db-image
create-new-db-image:
	docker compose exec database psql $(LOCAL_DB_CONN_STRING) -c VACUUM FULL
	docker commit czgenepi-database-1 temp_db_image
	export AWS_ACCOUNT_ID=$$(aws sts get-caller-identity --profile $(AWS_DEV_PROFILE) | jq -r .Account); \
	export DOCKER_REPO=$${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com; \
	export TAGGED_IMAGE="$${DOCKER_REPO}/genepi-devdb:build-$$(date +%F)"; \
	echo dockerx build --platform linux/amd64 -t $${TAGGED_IMAGE} -f ./docker/Dockerfile.devdb ./docker; \
	docker buildx build --platform linux/amd64 -t $${TAGGED_IMAGE} -f ./docker/Dockerfile.devdb ./docker && \
	docker rmi temp_db_image; \
	echo "Tagged image is ready for testing/pushing:"; \
	echo "  $${TAGGED_IMAGE}"

.PHONY: check-images
check-images: ## Spot-check the gisaid image
	$(docker_compose) run --no-deps --rm gisaid /usr/src/app/aspen/workflows/test-gisaid.sh
	$(docker_compose) run --no-deps --rm nextstrain /usr/src/app/aspen/workflows/test-nextstrain.sh
	$(docker_compose) run --no-deps --rm pangolin /usr/src/app/aspen/workflows/test-pangolin.sh

.PHONY: imagecheck-genepi-%
imagecheck-genepi-%: ## Spot-check backend/batch images
	docker run --rm $(IMAGE) /usr/src/app/aspen/workflows/test-$(subst imagecheck-genepi-,,$@).sh

.PHONY: imagecheck-genepi-frontend
imagecheck-genepi-frontend: ## Spot-check frontend image
	true

.PHONY: backend-debugger
backend-debugger: ## Attach to the backend service (useful for pdb)
	docker attach $$($(docker_compose) ps | grep backend | cut -d ' ' -f 1 | head -n 1)

.PHONY: local-status
local-status: ## Show the status of the containers in the dev environment.
	docker ps -a | grep --color=no -e 'CONTAINER\|genepi'

.PHONY: local-rebuild
local-rebuild: .env.ecr local-ecr-login ## Rebuild local dev without re-importing data
	$(docker_compose) --profile $(LOCALDEV_PROFILE) build
	$(docker_compose) --profile $(LOCALDEV_PROFILE) up -d

.PHONY: local-rebuild-workflows
local-rebuild-workflows: .env.ecr local-ecr-login ## Rebuild batch containers
	$(docker_compose) --profile all build
	$(docker_compose) --profile all up -d

.PHONY: local-sync
local-sync: local-rebuild local-init local-hostconfig ## Re-sync the local-environment state after modifying library deps or docker configs

.PHONY: local-start
local-start: .env.ecr ## Start a local dev environment that's been stopped.
	$(docker_compose) --profile $(LOCALDEV_PROFILE) up -d

.PHONY: local-stop
local-stop: ## Stop the local dev environment.
	$(docker_compose) --profile '*' stop

.PHONY: local-clean
local-clean: local-stop local-nohostconfig ## Remove everything related to the local dev environment (including db data!)
	-if [ -f ./oauth/pkcs12/server.crt ] ; then \
		if [ "$$(uname -s)" == "Linux" ]; then \
			echo "Removing this certificate from /usr/local/share requires sudo access"; \
		sudo cp oauth/pkcs12/server.crt /usr/local/share/ca-certificates/; \
		sudo update-ca-certificates; \
		fi; \
		if [ "$$(uname -s)" == "Darwin" ]; then \
			export CERT=$$(docker run -v $(PWD)/oauth/pkcs12:/tmp/certs --workdir /tmp/certs --rm=true --entrypoint "" soluto/oidc-server-mock:0.3.0 bash -c "openssl x509 -in server.crt -outform DER | sha1sum | cut -d ' ' -f 1"); \
			echo ""; \
			echo "Removing this certificate requires sudo access"; \
			sudo security delete-certificate -Z $${CERT} /Library/Keychains/System.keychain; \
		fi; \
	fi;
	-rm -rf ./oauth/pkcs12/server*
	-rm -rf ./oauth/pkcs12/certificate*
	$(docker_compose) --profile $(LOCALDEV_PROFILE) rm -sfv
	-docker volume rm czgenepi_localstack

.PHONY: local-logs
local-logs: ## Tail the logs of the dev env containers. ex: make local-logs CONTAINER=backend
	$(docker_compose) logs -f $(CONTAINER)

.PHONY: local-shell
local-shell: ## Open a command shell in one of the dev containers. ex: make local-shell CONTAINER=frontend
	$(docker_compose) exec $(CONTAINER) bash

.PHONY: local-pgconsole
local-pgconsole: ## Connect to the local postgres database.
	$(docker_compose) exec database psql "$(LOCAL_DB_CONN_STRING)?options=--search_path%3d$(DB_SEARCH_PATH)"

.PHONY: local-dbconsole
local-dbconsole: ## Connect to the local postgres database.
	$(docker_compose) exec backend aspen-cli db --local interact

.PHONY: local-dbconsole-profile
local-dbconsole-profile: ## Connect to the local postgres database and profile queries.
	$(docker_compose) exec backend aspen-cli db --local interact --profile

.PHONY: local-update-backend-deps
local-update-backend-deps: ## Update poetry.lock to reflect pyproject.toml file changes.
	$(docker_compose) exec backend poetry update

.PHONY: local-update-frontend-deps
local-update-frontend-deps: ## Update package-lock.json to reflect package.json file changes.
	$(docker_compose) exec frontend npm install

### ACCESSING CONTAINER MAKE COMMANDS ###################################################
utility-%: ## Run make commands in the CURRENT running backend container. See src/backend/Makefile
	$(docker_compose) exec backend make $(subst utility-,,$@) MESSAGE="$(MESSAGE)"

backend-%: .env.ecr  ## Run make commands in a NEW backend container. See src/backend/Makefile
	$(docker_compose) run --no-deps --rm backend make $(subst backend-,,$@)

frontend-%: .env.ecr ## Run make commands in the frontend container (src/frontend/Makefile)
	$(docker_compose) run -e CI=true --no-deps --rm frontend make $(subst frontend-,,$@)

### PIPELINE TESTS ###################################################
.PHONY: pipeline-test-gisaid
pipeline-test-gisaid:
	export BOTO_ENDPOINT_URL=http://localstack.genepinet.localdev:4566; \
	export AWS_ACCESS_KEY_ID=aaa; \
	export AWS_SECRET_ACCESS_KEY=bbb; \
	export MINIWDL__TASK_RUNTIME__DEFAULTS='{"docker_network":"genepinet"}'; \
	miniwdl run --env AWS_ACCESS_KEY_ID --env AWS_SECRET_ACCESS_KEY --env BOTO_ENDPOINT_URL --input inputs.json --verbose -o output.json .happy/terraform/modules/sfn_config/gisaid-test.wdl 
	$(docker_compose) run --no-deps --rm backend make pipeline-test-gisaid


### WDL ###################################################
.PHONY: wdl-lint
wdl-lint:
	set -e; for i in $$(find .happy/terraform/modules/sfn_config -name '*.wdl'); do echo $${i}; miniwdl check $${i}; done


### TERRAFORM ###################################################
.PHONY: tf-lint
tf-lint:
	set -e; for i in $$(find .happy/terraform/envs ! -path .happy/terraform/envs -type d -maxdepth 1); do echo $${i}; pushd $${i}; terraform init; terraform validate; tflint --module; popd; done
