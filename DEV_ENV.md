# Local Development Environment

## Development quickstart
1. [install docker](https://docs.docker.com/get-docker/). If brew is installed run `brew install docker`.
1. From the root of this repository, run `make local-init` to build and run the dev environment. The first build takes awhile, but subsequent runs will use cached artifacts.
1. Visit [http://localhost:3000](http://localhost:3000) to view the backend, and [http://localhost:8000](http://localhost:8000) for the frontend.
1. `make local-dbconsole` starts a connection with the local postgresql db.
1. **Open the source code and start editing!**
  - Modify code in the `src/ts` directory, save your changes and the browser will update in real time.
  - Modify code in the `src/py` directory, and the backend api will reload automatically.

### OAuth creds
Username: User1 / Password: pwd ([users are defined here](oauth/users.json))

### Containers managed by the dev environment
The Aspen dev environment is a set of containers defined in [docker-compose.yml](docker-compose.yml). The [backend docker image](src/py/Dockerfile) and [frontend docker image](src/ts/Dockerfile) are built locally. Update any of these files as necessary and run `make local-sync` to sync your dev environment with these configs.

![Dev Environment Containers](docs/images/genepi-localdev.png)

### Updating frontend/backend dependencies
Both the frontend and backend services will automatically reload when their source code is modified, but they won't automatically rebuild when their dependencies (such as npm or pip package lists) change.

To update the dev env to reflect changes to [src/ts/package.json](src/ts/package.json) or [src/py/Pipfile](src/py/Pipfile), run `make local-sync`

### Update Dev Data
The dev environment is initialized with AWS Secrets/S3 data in the [src/py/scripts/setup_dev_data.sh](src/py/scripts/setup_dev_data.sh) script, as well as DB migrations from [src/py/database_migrations](src/py/database_migrations). To add more data or run migrations, modify these scripts and run `make local-init` to reload the dev environment's data stores.

### Make targets for managing dev:

| Command                 | Description                                                                          | Notes                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `make help`               | Learn more about what `make` targets are available                                   |                                                          |
| `make local-init`         | Launch a new local dev env and populate it with test data.                           |                                                          |
| `make local-start`        | Start a local dev environment that's been stopped.                                   |                                                          |
| `make local-stop`         | Stop the local dev environment.                                                      |                                                          |
| `make local-dbconsole`    | Connect to the local database.                                                       |                                                          |
| `make local-logs`         | Tail the logs of the dev env containers.                                             | Run `make local-logs CONTAINER=backend` to tail the logs of a specific container. Dev containers are: backend, frontend, localstack, database, oidc |
| `make local-shell CONTAINER=frontend`  | Open a command shell in one of the dev containers                       | Dev containers are: backend, frontend, localstack, database, oidc |
| `make local-status`       | Show the status of the containers in the dev environment.                            |                                                          |
| `make local-clean`        | Remove everything related to the local dev environment (including db data!)          |                                                          |
| `make local-sync`         | Re-sync the local-environment state after modifying library deps or docker configs    |                                                          |

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
