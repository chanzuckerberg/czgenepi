## Setup Auth0:

you will need to have a specific `.env` file to read in `AUTH0` variables (place this file in `src/py/covidr`), ask project leads for this file, there will be different `.env` files for local development, staging, and production. 

if deploying to a custom staging environment change this variable in the .env file:

`AUTH0_CALLBACK_URL="http://<custom-staging-env-name>.us-west-2.elasticbeanstalk.com/callback"`

if you are new to working on covidr ask a project lead to ask your eb staging env to the list of allowed callbacks in Auth0. 

## Deployment of the python web services

Because the [AWS Elastic Beanstalk CLI](https://github.com/aws/aws-elastic-beanstalk-cli) depends on libraries that conflict with the libraries required by our development workflow, it is recommended to install the AWS EB CLI tools in a separate virtual environment.

1. Set up a virtual environment and install the EB CLI.
```bash
aspen% python -V
Python 3.7.6
aspen% python3.7 -m venv .venv-ebcli
aspen% .venv-ebcli/bin/pip install awsebcli
```
2. Set up the elastic beanstalk configuration in the top-level directory.
```bash
aspen% .venv-ebcli/bin/eb init --region=us-west-2 --platform python-3.7 aspen
```
3. Pick a reasonable identifier for your target deployment environment, such as aspen-<your-user-name>.  Create the environment if you haven't done so before.  This will deploy the code as well, so if you are doing this step, skip the next one.
```bash
aspen% .venv-ebcli/bin/eb create aspen-myusername --cname aspen-myusername
```
4. If you have already created an environment in the past, just updating the existing deployment environment.
```bash
aspen% .venv-ebcli/bin/eb deploy aspen-myusername
```
5. Visit your deployment.  This should open your deployment environment in your browser.
```bash
aspen% .venv-ebcli/bin/eb open aspen-myusername
```
6. Remember to remove your environment when you are not using it.
```bash
aspen% .venv-ebcli/bin/eb terminate aspen-myusername
```

## Database concerns

### Creating and initializing the local database.
```bash
aspen% make init-local-db
```

### Interacting with the local database.
It is possible to interact with the local database in ipython:
```
% aspen-cli db interact
Python 3.7.6 (default, Dec 22 2019, 01:09:06)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.20.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: session = engine.make_session()

In [2]: session.query(User).all()
Out[2]: []

In [3]:
```

### Autogeneration of schema migration

1. Make changes to the models.
2. Run `ENV=dev alembic revision --autogenerate -m "SOME DESCRIPTIVE MESSAGE" --rev-id $(date +%Y%M%d_%H%M%S)`
3. Verify that the schema migration generated in `database_migrations/versions/` is sane.
4. Run `ENV=dev alembic upgrade head` to test the schema migration on your local database.

## Updating python dependencies

To update python dependencies, update the [`Pipfile`](../../Pipfile) and run `make update-deps`.  This will update [`Pipfile.lock`](../../Pipfile.lock) and [`requirements.txt`](../../src/py/requirements.txt) (used by setup.py), and [`requirements-dev.txt`](../../src/py/requirements-dev.txt) (used by tests).
