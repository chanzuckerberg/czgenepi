# COVIDR

This repository contains the code for the gen-epi project.

## Deployment of the python web services

1. Set up a virtual environment and activate it.
```bash
% python -V
Python 3.7.6
% python3.7 -m venv .venv
% source .venv/bin/activate
```
2. Install the requirements for the python package.
```bash
% pip install -r src/py/requirements.txt
```
3. Install awsebcli.
```bash
% pip install awsebcli
```
4. Set up the elastic beanstalk configuration.
```bash
% eb init --region=us-west-2 --platform python-3.7 covidr
```
5. Deploy the code.  You should deploy to the `covidr-staging` environment.
```bash
% eb deploy covidr-staging
```

## Database concerns

### Creating and initializing the local database.
```bash
% make init-local-db
```

### Autogeneration of schema migration

1. Make changes to the models.
2. Run `ENV=local alembic revision --autogenerate -m "SOME DESCRIPTIVE MESSAGE" --rev-id $(date +%Y%M%d_%H%M%S)`
3. Verify that the schema migration generated in `database_migrations/versions/` is sane.
4. Run `ENV=local alembic upgrade head` to test the schema migration on your local database.
