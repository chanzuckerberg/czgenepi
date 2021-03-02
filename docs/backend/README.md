## AWS setup

### Staging setup

#### AWS Secret

Create a secret called `aspen-auth0` with the following contents:
```json
{
  "AUTH0_DOMAIN": "<MY_DOMAIN_HERE>.auth0.com",
  "AUTH0_CLIENT_ID": "<AUTH0_CLIENT_HERE>",
  "AUTH0_CLIENT_SECRET": "<AUTH0_CLIENT_SECRET_HERE>"
}
```

Take note of the ARN of the created secret, which will be needed in the next step.

#### IAM setup

Create an AWS IAM policy with the following rules, and name it `aspen-elasticbeanstalk-ec2-policies`.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "ec2:DescribeTags",
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": "secretsmanager:GetSecretValue",
            "Resource": [
                "<ARN_FOR_SECRET>"
            ]
        }
    ]
}
```

Then create an AWS IAM role, naming it `aspen-elasticbeanstalk-ec2-role`, attaching the following policies:

1. AWSElasticBeanstalkWebTier
1. AWSElasticBeanstalkMulticontainerDocker
1. AWSElasticBeanstalkWorkerTier
1. aspen-elasticbeanstalk-ec2-policies

## Deploying the python web services

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
aspen% .venv-ebcli/bin/eb create aspen-<my_username> --cname aspen-<my_username> --envvars AWS_REGION=us-west-2,FLASK_ENV=staging --instance_profile aspen-elasticbeanstalk-ec2-role
```

If you want ssh access to the EC2 servers, add a ssh keypair using the EC2 console and add `-k <keyname>` to your `eb create` command.

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

### Interacting with the local database in sql

You can also connect to your local psql console by running:
```
(.venv) aspen% docker exec -it aspen-local psql -h localhost -d aspen_db -U user_rw
psql (13.1)
Type "help" for help.

aspen_db=> select * from aspen.users;
 id | name | email | auth0_user_id | group_admin | system_admin | group_id
----+------+-------+---------------+-------------+--------------+----------
(0 rows)

aspen_db=>
```

### Interacting with the local database in python

It is possible to interact with the local database in ipython:
```
(.venv) aspen% aspen-cli db interact
Python 3.7.6 (default, Dec 22 2019, 01:09:06)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.20.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: session = engine.make_session()

In [2]: session.query(User).all()
Out[2]: []

In [3]:
```

### Profiling SqlAlchemy queries

`aspen-cli db interact` has a `--profile` option that prints out every query that's executed and how long they take:

```
(.venv) aspen% aspen-cli db interact --profile
Python 3.7.9 (default, Sep  6 2020, 13:20:25)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.20.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: session = engine.make_session()

In [2]: results = session.query(Sample).all()
DEBUG:sqltime:Start Query: SELECT aspen.samples.id AS aspen_samples_id, aspen.samples.submitting_group_id AS aspen_samples_submitting_group_id, aspen.samples.private_identifier AS aspen_samples_private_identifier, aspen.samples.original_submission AS aspen_samples_original_submission, aspen.samples.public_identifier AS aspen_samples_public_identifier, aspen.samples.sample_collected_by AS aspen_samples_sample_collected_by, aspen.samples.sample_collector_contact_email AS aspen_samples_sample_collector_contact_email, aspen.samples.sample_collector_contact_address AS aspen_samples_sample_collector_contact_address, aspen.samples.authors AS aspen_samples_authors, aspen.samples.collection_date AS aspen_samples_collection_date, aspen.samples.location AS aspen_samples_location, aspen.samples.division AS aspen_samples_division, aspen.samples.country AS aspen_samples_country, aspen.samples.organism AS aspen_samples_organism, aspen.samples.host AS aspen_samples_host, aspen.samples.purpose_of_sampling AS aspen_samples_purpose_of_sampling, aspen.samples.specimen_processing AS aspen_samples_specimen_processing
FROM aspen.samples
DEBUG:sqltime:Query Complete!
DEBUG:sqltime:Total Time: 0.012416

In [3]:
```

### Autogeneration of schema migration

1. Make changes to the models.
2. Run `ENV=dev alembic revision --autogenerate -m "SOME DESCRIPTIVE MESSAGE" --rev-id $(date +%Y%m%d_%H%M%S)`
3. Verify that the schema migration generated in `database_migrations/versions/` is sane.
4. Run `ENV=dev alembic upgrade head` to test the schema migration on your local database.

## Updating python dependencies

To update python dependencies, update the [`Pipfile`](../../Pipfile) and run `make update-deps`.  This will update [`Pipfile.lock`](../../Pipfile.lock) and [`requirements.txt`](../../src/py/requirements.txt) (used by setup.py), and [`requirements-dev.txt`](../../src/py/requirements-dev.txt) (used by tests).
