SHELL := /bin/bash

### DOCKER ENVIRONMENTAL VARS #################################################
export DOCKER_BUILDKIT:=1
export COMPOSE_DOCKER_CLI_BUILD:=1
export COMPOSE_OPTS:=--env-file .env.ecr
export AWS_DEV_PROFILE=genepi-dev
export AWS_PROD_PROFILE=genepi-prod
export BACKEND_APP_ROOT=/usr/src/app

### DATABASE VARIABLES #################################################
DB_SEARCH_PATH=aspen
LOCAL_DB_NAME = aspen_db
LOCAL_DB_SERVER = localhost:5432
# This has to be "postgres" to ease moving snapshots from RDS.
LOCAL_DB_ADMIN_USERNAME = postgres
LOCAL_DB_ADMIN_PASSWORD = password_postgres
LOCAL_DB_RW_USERNAME = user_rw
LOCAL_DB_RW_PASSWORD = password_rw
LOCAL_DB_RO_USERNAME = user_ro
LOCAL_DB_RO_PASSWORD = password_ro


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
	docker-compose $(COMPOSE_OPTS) run -e DB_URI backend sh -c 'pip install . && aspen-cli db --remote interact --connect'

### DOCKER LOCAL DEV #########################################
.PHONY: local-hostconfig
local-hostconfig:
	if [ "$$(uname -s)" == "Darwin" ]; then \
	  sudo ./scripts/happy hosts install; \
	fi

.PHONY: local-nohostconfig
local-nohostconfig:
	if [ "$$(uname -s)" == "Darwin" ]; then \
	  sudo ./scripts/happy hosts uninstall; \
	fi

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
	docker-compose stop database
	docker-compose rm database
	docker-compose $(COMPOSE_OPTS) -f docker-compose.yml -f docker-compose-emptydb.yml up -d
	sleep 10 # hack, let postgres start up cleanly.
	-docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c "ALTER USER $(LOCAL_DB_ADMIN_USERNAME) WITH PASSWORD '$(LOCAL_DB_ADMIN_PASSWORD)';"
	-docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c "CREATE USER $(LOCAL_DB_RW_USERNAME) WITH PASSWORD '$(LOCAL_DB_RW_PASSWORD)';"
	-docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c "CREATE USER $(LOCAL_DB_RO_USERNAME) WITH PASSWORD '$(LOCAL_DB_RO_PASSWORD)';"
	-docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c "GRANT ALL PRIVILEGES ON DATABASE $(LOCAL_DB_NAME) TO $(LOCAL_DB_RW_USERNAME);"
	docker-compose $(COMPOSE_OPTS) run sh -c 'aspen-cli db --local create; alembic stamp head'


.PHONY: local-init
local-init: oauth/pkcs12/certificate.pfx .env.ecr local-ecr-login local-hostconfig ## Launch a new local dev env and populate it with test data.
	docker-compose $(COMPOSE_OPTS) pull database
	docker-compose $(COMPOSE_OPTS) up -d database frontend backend localstack oidc
	# Wait for psql to be up
	while [ -z "$$(docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c 'select 1')" ]; do echo "waiting for db to start..."; sleep 1; done;
	@docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c "alter user $(LOCAL_DB_ADMIN_USERNAME) with password '$(LOCAL_DB_ADMIN_PASSWORD)';"
	docker-compose exec -T backend $(BACKEND_APP_ROOT)/scripts/setup_dev_data.sh
	docker-compose exec -T backend alembic upgrade head
	docker-compose exec -T backend python scripts/setup_localdata.py
	docker-compose exec -T backend pip install .

.PHONY: prepare-new-db-snapshot
prepare-new-db-snapshot:
	docker-compose $(COMPOSE_OPTS) pull database
	docker-compose $(COMPOSE_OPTS) up -d database
	# Wait for psql to be up
	while [ -z "$$(docker-compose exec -T database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)" -c 'select 1')" ]; do echo "waiting for db to start..."; sleep 1; done;
	docker-compose exec -T backend alembic upgrade head
	@echo
	@echo "Ok, local db is prepared and ready to go -- make any additional changes you need to and then run:"
	@echo "make create_new_db_image"

.PHONY: create_new_db_image
create_new_db_image:
	docker exec aspen_database_1 psql postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME) -c VACUUM FULL
	docker commit aspen_database_1 temp_db_image
	export AWS_ACCOUNT_ID=$$(aws sts get-caller-identity --profile $(AWS_DEV_PROFILE) | jq -r .Account); \
	export DOCKER_REPO=$${AWS_ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com; \
	export TAGGED_IMAGE="$${DOCKER_REPO}/genepi-devdb:build-$$(date +%F)"; \
	echo docker build -t $${TAGGED_IMAGE} -f ./docker/Dockerfile.devdb ./docker; \
	docker build -t $${TAGGED_IMAGE} -f ./docker/Dockerfile.devdb ./docker; \
	docker rmi temp_db_image; \
	echo "Tagged image is ready for testing/pushing:"; \
	echo "  $${TAGGED_IMAGE}"

.PHONY: check-images
check-images: ## Spot-check the gisaid image
	docker-compose $(COMPOSE_OPTS) run --no-deps --rm gisaid /usr/src/app/aspen/workflows/test-gisaid.sh
	docker-compose $(COMPOSE_OPTS) run --no-deps --rm nextstrain /usr/src/app/aspen/workflows/test-nextstrain.sh
	docker-compose $(COMPOSE_OPTS) run --no-deps --rm pangolin /usr/src/app/aspen/workflows/test-pangolin.sh

.PHONY: imagecheck-genepi-%
imagecheck-genepi-%: ## Spot-check backend/batch images
	docker run --rm $(IMAGE) /usr/src/app/aspen/workflows/test-$(subst imagecheck-genepi-,,$@).sh

.PHONY: imagecheck-genepi-frontend
imagecheck-genepi-frontend: ## Spot-check frontend image
	true

.PHONY: backend-debugger
backend-debugger: ## Attach to the backend service (useful for pdb)
	docker attach $$(docker-compose ps | grep backend | cut -d ' ' -f 1 | head -n 1)

.PHONY: local-status
local-status: ## Show the status of the containers in the dev environment.
	docker ps -a | grep --color=no -e 'CONTAINER\|aspen'

.PHONY: local-rebuild
local-rebuild: .env.ecr local-ecr-login ## Rebuild local dev without re-importing data
	docker-compose $(COMPOSE_OPTS) build frontend backend
	docker-compose $(COMPOSE_OPTS) up -d

.PHONY: local-rebuild-workflows
local-rebuild-workflows: .env.ecr local-ecr-login ## Rebuild batch containers
	docker-compose $(COMPOSE_OPTS) build gisaid pangolin nextstrain
	docker-compose $(COMPOSE_OPTS) up -d

.PHONY: local-sync
local-sync: local-rebuild local-init local-hostconfig ## Re-sync the local-environment state after modifying library deps or docker configs

.PHONY: local-start
local-start: .env.ecr ## Start a local dev environment that's been stopped.
	docker-compose $(COMPOSE_OPTS) up -d

.PHONY: local-stop
local-stop: ## Stop the local dev environment.
	docker-compose stop

.PHONY: local-clean
local-clean: local-nohostconfig ## Remove everything related to the local dev environment (including db data!)
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
	docker-compose rm -sf
	-docker rm -f aspen_utility_1
	-docker volume rm aspen_localstack
	-docker network rm aspen_genepinet

.PHONY: local-logs
local-logs: ## Tail the logs of the dev env containers. ex: make local-logs CONTAINER=backend
	docker-compose logs -f $(CONTAINER)

.PHONY: local-shell
local-shell: ## Open a command shell in one of the dev containers. ex: make local-shell CONTAINER=frontend
	docker-compose exec $(CONTAINER) bash

.PHONY: local-pgconsole
local-pgconsole: ## Connect to the local postgres database.
	docker-compose exec database psql "postgresql://$(LOCAL_DB_ADMIN_USERNAME):$(LOCAL_DB_ADMIN_PASSWORD)@$(LOCAL_DB_SERVER)/$(LOCAL_DB_NAME)?options=--search_path%3d$(DB_SEARCH_PATH)"

.PHONY: local-dbconsole
local-dbconsole: ## Connect to the local postgres database.
	docker-compose exec backend aspen-cli db --local interact

.PHONY: local-dbconsole-profile
local-dbconsole-profile: ## Connect to the local postgres database and profile queries.
	docker-compose exec backend aspen-cli db --local interact --profile

.PHONY: local-update-backend-deps
local-update-backend-deps: ## Update poetry.lock to reflect pyproject.toml file changes.
	docker-compose exec backend /opt/poetry/bin/poetry update

.PHONY: local-update-frontend-deps
local-update-frontend-deps: ## Update package-lock.json to reflect package.json file changes.
	docker-compose exec frontend npm install

### ACCESSING CONTAINER MAKE COMMANDS ###################################################
utility-%: ## Run make commands in the backend container (src/backend/Makefile) DEPRECATED!!
	docker-compose exec backend make $(subst utility-,,$@) MESSAGE="$(MESSAGE)"

backend-%: .env.ecr ## Run make commands in the backend container (src/backend/Makefile)
	docker-compose $(COMPOSE_OPTS) run --no-deps --rm backend make $(subst backend-,,$@)

.PHONY: frontend-e2e-ci
frontend-e2e-ci: .env.ecr ## Run e2e tests with s3 screenshot wrapper.
	docker-compose $(COMPOSE_OPTS) run -e CI=true --no-deps frontend make e2e; \
	exit_status=$$?; \
	test_container=$$(docker ps -a | grep -i frontend_run | cut -d ' ' -f 1 | head -n 1); \
	docker cp $${test_container}:/tmp/screenshots .; \
	docker rm $${test_container}; \
	aws s3 cp --recursive ./screenshots $${S3_PREFIX}; \
	exit $$exit_status

frontend-%: .env.ecr ## Run make commands in the frontend container (src/frontend/Makefile)
	docker-compose $(COMPOSE_OPTS) run -e CI=true --no-deps --rm frontend make $(subst frontend-,,$@)


### WDL ###################################################
.PHONY: wdl-lint
wdl-lint:
	set -e; for i in $$(find .happy/terraform/modules/sfn_config -name '*.wdl'); do echo $${i}; miniwdl check $${i}; done


### TERRAFORM ###################################################
.PHONY: tf-lint
tf-lint:
	set -e; for i in $$(find .happy/terraform/envs ! -path .happy/terraform/envs -type d -maxdepth 1); do echo $${i}; pushd $${i}; terraform init; terraform validate; tflint --module; popd; done
