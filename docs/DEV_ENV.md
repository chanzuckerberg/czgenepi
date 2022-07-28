# Local Development Environment

## Required software
Install general pre-requisites:
1. Install basic developer tools:
```
xcode-select --install
```
2. Install homebrew: https://brew.sh/
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
3. Install CZI homebrew tap:
```
brew tap chanzuckerberg/tap
```
4. Install base software:
```
brew install chanzuckerberg/tap/happy aws-oidc blessclient@1 fogg pre-commit
brew install awscli@2 python3 jq docker terraform
brew install --cask session-manager-plugin
```
5. Install and start [docker desktop](https://docs.docker.com/desktop/)

6. Ask a CZGE engineer to add your email to [this list of authorized users](https://github.com/chanzuckerberg/shared-infra/blob/71a93d8493b597be063a03c17e78a73cb3b0a764/terraform/accounts/okta-czi-prod/sci-genepi-teams.tf#L36) for access to CZGE AWS accounts.

7. Request read access to the [czgenepi-infra repo](https://github.com/chanzuckerberg/genepi-infra)

8. Configure aws access:
```
aws-oidc configure --issuer-url https://czi-prod.okta.com --client-id aws-config --config-url https://aws-config-generation.prod.si.czi.technology
blessclient import-config git@github.com:/chanzuckerberg/genepi-infra/blessconfig.yml

# accept defaults for region (us-west-2) and AWS default role (poweruser)
```

## Development quickstart

1. Run `pre-commit install` to install all the git pre-commit hooks
1. Clone the CZ Gen Epi repository. 
1. From the root of this repository (`cd czgenepi`), run `make local-init` to build and run the dev environment. The first build takes awhile, but subsequent runs will use cached artifacts.
1. Visit [http://backend.genepinet.localdev:3000](http://backend.genepinet.localdev:3000) to view the backend, and [http://frontend.genepinet.localdev:8000](http://frontend.genepinet.localdev:8000) for the frontend.
1. `make local-pgconsole` starts a connection with the local postgresql db.
1. **Open the source code and start editing!**
   - Modify code in the `src/frontend` directory, save your changes and the browser will update in real time.
   - Modify code in the `src/backend` directory, and the backend api will reload automatically.

### OAuth creds

Username: User1 / Password: pwd ([users are defined here](../oauth/users.json))

### Containers managed by the dev environment

The Aspen dev environment is a set of containers defined in [docker-compose.yml](../docker-compose.yml). The [backend docker image](../src/backend/Dockerfile) and [frontend docker image](../src/frontend/Dockerfile) are built locally. Update any of these files as necessary and run `make local-sync` to sync your dev environment with these configs.

![Dev Environment Containers](images/genepi-localdev.png)

### Updating frontend/backend dependencies

Both the frontend and backend services will automatically reload when their source code is modified, but they won't automatically rebuild when their dependencies (such as npm or pip package lists) change.

To update frontend changes:

1. add dependency to [src/frontend/package.json](../src/frontend/package.json) (or add a new scripts command)
2. run `make local-update-frontend-deps` (updates package-lock.json)
2. run `make local-sync`

To update backend dependencies:

1. run 'docker compose exec backend /opt/poetry/bin/poetry add PACKAGE_NAME_HERE`

### Update Dev Data

The dev environment is initialized with AWS Secrets/S3 data in the [scripts/setup_dev_data.sh](../scripts/setup_dev_data.sh),  [src/backend/scripts/setup_localdata.py](../src/backend/scripts/setup_localdata.py) script, as well as DB migrations from [src/backend/database_migrations](../src/backend/database_migrations). 

- To add more data or run migrations, modify these scripts and run `make local-init` to reload the dev environment's data stores. 
- Some data such as tree jsons may be cached and need `make local-clean` before `make local-init` to update.
- Changes to the postgresql database via `make local-pgconsole` are live immediately.

### Make targets for managing dev:

| Command                                                           | Description                                                                        | Notes                                                                                                                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `make help`                                                       | Learn more about what `make` targets are available                                 |                                                                                                                                                     |
| `make local-init`                                                 | Launch a new local dev env and populate it with test data.                         |                                                                                                                                                     |
| `make local-start`                                                | Start a local dev environment that's been stopped.                                 |                                                                                                                                                     |
| `make local-stop`                                                 | Stop the local dev environment.                                                    |                                                                                                                                                     |
| `make local-pgconsole`                                            | Connect to the local database via the psql CLI.                                    |                                                                                                                                                     |
| `make local-dbconsole`                                            | Connect to the local database with a python interpreter.                           |                                                                                                                                                     |
| `make local-logs`                                                 | Tail the logs of the dev env containers.                                           | Run `make local-logs CONTAINER=backend` to tail the logs of a specific container. Dev containers are: backend, frontend, localstack, database, oidc |
| `make local-shell CONTAINER=frontend`                             | Open a command shell in one of the dev containers                                  | Dev containers are: backend, frontend, localstack, database, oidc                                                                                   |
| `make local-status`                                               | Show the status of the containers in the dev environment.                          |                                                                                                                                                     |
| `make local-clean`                                                | Remove everything related to the local dev environment (including db data!)        |                                                                                                                                                     |
| `make local-sync`                                                 | Re-sync the local-environment state after modifying library deps or docker configs |                                                                                                                                                     |
| `make frontend-tests`                                             | run `npm test` in the frontend container (unit tests confined to `src/frontend`)|                                                                                                                                                     |
| `make frontend-e2e`                                               | run `npm run e2e` in the frontend container (end to end tests confined to `src/frontend`)|                                                                                                                                                     |
| `make frontend-lint`                                              | run `npm run lint` to lint (eslint & stylelint) and autofix front end code |                                                                                                                                                     |
| `make frontend-test-build`                                        | run `npm run build` in `src/frontend`                                              |                                                                                                                                                     |
| `make frontend-check-style`                                       | run `npm run lint-ci` in `src/frontend` to lint (eslint & stylelint) but NOT fix front end code |                                                                                                                                                     |
| `make backend-alembic-upgrade-head`                               | Upgrade local DB with new revisions                                                |                                                                                                                                                     |
| `make utility-alembic-autogenerate MESSAGE="descriptive message"` | Autogenerate migration against local DB                                            |                                                                                                                                                     |
| `make backend-alembic-undo-migration`                             | Undo the last applied migration                                                    |                                                                                                                                                     |
| `make backend-test`                                               | Runs pytest in `src/backend`                                                       |                                                                                                                                                     |
| `make backend-check-style`                                        | Runs mypy, flake8, isort, and black style checkers against files in `src/backend`  |                                                                                                                                                     |
| `make backend-run-style`                                          | Runs isort and black against files in `src/backend`                                |                                                                                                                                                     |
| `make backend-debugger`                                           | Attach to the backend service                                                      | use this to connect to pdb console if setting break points using pdb                                                                                |
| `make rm-pycache`                                                 | removes all `__pycache__` files                                                    | run this command if encountering issues with pycharm debugger (containers exiting prematurely)                                                      |

### External dependencies

The dev environment has no network dependencies, but it launches some extra containers to mock external dependencies:

- [LocalStack](https://github.com/localstack/localstack) to mock AWS
- [OIDC server mock](https://github.com/Soluto/oidc-server-mock) in place of Auth0.
- [postgres](https://hub.docker.com/_/postgres) in place of RDS.

#### TLS Certificate for mock authentication service

Due to browser security considerations, we must run the mock authentication
service using a self-signed certificate. The local-init and local-clean make targets
handle managing a keypair/certificate for each dev env and installing it in the
OSX system keychain.

Details: OIDC requires setting a token, and requires the cookie storing that
token to be stored with samesite=None to work properly. Recent versions of
browsers such as Chrome intentionally only allow samesite=None if the connection
is over a secure network connection i.e. TLS. Thus we need to run even a local
development auth service behind a certificate. We bundle a pre-generated
self-signed cert in for convenience.

#### Configuring Pycharm with Docker Compose:

Follow the instructions in [the wiki](https://czi.atlassian.net/wiki/spaces/SI/pages/1801100933/PyCharm+configuration+for+Happy+Path)

