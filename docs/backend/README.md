## Deployment of the python web services

Because the [AWS Elastic Beanstalk CLI](https://github.com/aws/aws-elastic-beanstalk-cli) depends on libraries that conflict with the libraries required by our development workflow, it is recommended to install the AWS EB CLI tools in a separate virtual environment.

1. Set up a virtual environment and install the EB CLI.
```bash
covidr% python -V
Python 3.7.6
covidr% python3.7 -m venv .venv-ebcli
covidr% .venv-ebcli/bin/pip install awsebcli
```
2. Set up the elastic beanstalk configuration in the `src/py` directory.
```bash
covidr% cd src/py
covidr/src/py% eb init --region=us-west-2 --platform python-3.7 covidr
```
3. Deploy the code.  You should deploy to the `covidr-staging` environment.
```bash
covidr/src/py% ../../.venv-ebcli/bin/eb deploy covidr-staging
```

## Database concerns

### Creating and initializing the local database.
```bash
covidr% make init-local-db
```

### Autogeneration of schema migration

1. Make changes to the models.
2. Run `ENV=dev alembic revision --autogenerate -m "SOME DESCRIPTIVE MESSAGE" --rev-id $(date +%Y%M%d_%H%M%S)`
3. Verify that the schema migration generated in `database_migrations/versions/` is sane.
4. Run `ENV=dev alembic upgrade head` to test the schema migration on your local database.
