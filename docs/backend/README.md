## Deployment of the python web services

Because the [AWS Elastic Beanstalk CLI](https://github.com/aws/aws-elastic-beanstalk-cli) depends on libraries that conflict with the libraries required by our development workflow, it is recommended to install the AWS EB CLI tools in a separate virtual environment.

1. Set up a virtual environment and install the EB CLI.
```bash
covidr% python -V
Python 3.7.6
covidr% python3.7 -m venv .venv-ebcli
covidr% .venv-ebcli/bin/pip install awsebcli
```
2. Set up the elastic beanstalk configuration in the top-level directory.
```bash
covidr% .venv-ebcli/bin/eb init --region=us-west-2 --platform python-3.7 covidr
```
3. Pick a reasonable identifier for your target deployment environment, such as covidr-<your-user-name>.  Create the environment if you haven't done so before.  This will deploy the code as well, so if you are doing this step, skip the next one.
```bash
covidr% .venv-ebcli/bin/eb create covidr-myusername --cname covidr-myusername
```
4. If you have already created an environment in the past, just updating the existing deployment environment.
```bash
covidr% .venv-ebcli/bin/eb deploy covidr-myusername
```
5. Visit your deployment.  This should open your deployment environment in your browser.
```bash
covidr% .venv-ebcli/bin/eb open covidr-myusername
```
6. Remember to remove your environment when you are not using it.
```bash
covidr% .venv-ebcli/bin/eb terminate covidr-myusername
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
