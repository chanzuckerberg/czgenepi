# Backend documentation

## Core technologies
CZGE's Backend application is built with the following stack:
- [FastAPI](https://fastapi.tiangolo.com/) is an async Python API framework
  - [pydantic](https://pydantic-docs.helpmanual.io/) is a data validation library used to de/serialize and validate api requests and responses
- [SQLAlchemy](https://www.sqlalchemy.org/) is an ORM
- [Alembic](https://alembic.sqlalchemy.org/en/latest/) is a tool for managing database migrations
- [pytest](https://docs.pytest.org/en/7.1.x/) is a testing framework

In addition it depends on some core external tools for data storage
- [PostgreSQL](https://www.postgresql.org/) is an RDBMS that stores most of our metadata
- [Amazon S3](https://aws.amazon.com/aws/s3) is a blob storage service that stores most of our job output

## App structure
The root of our backend application is in `src/backend`. noteworthy subdirectories are annotated here:
- `aspen` - Most of our backend application lives here
  - `api` - entrypoint for our backend API service
    - `schemas` - API input/output validation models live here
    - `utils` - Code used by multiple endpoints (this could be better organized)
    - `views` - API endpoint code lives here
  - `workflows` - code related to our compute jobs
  - `database` - code related to establishing DB connections / sessions
    - `models` - SQLAlchemy models used across our backend application
- `database_migrations` - alembic migrations
- `etc` - some basic setup configuration for our backend container

## Discoverability
Our backend API is self-documenting via OpenAPI and JSON-Schema:
- API documentation: https://api.czgenepi.org/v2/docs
- JSON Schema: https://api.czgenepi.org/v2/openapi.json

## Creating a new API endpoint.
Some endpoints will only need the last few steps, but this is the maximal case:
1. Create a new module in `src/backend/aspen/api/views` and add a router:
```python
# src/backend/aspen/api/views/new_module.py
from fastapi import APIRouter
router = APIRouter()
```
2. Import it into `src/backend/aspen/api.main.py` and create a route for it:
```python
# src/backend/aspen/api/main.py
import new_module from api.views
...
    _app.include_router(
        new_module.router,
        prefix="/v2/new_module",
        dependencies=[Depends(get_auth_user)],  # If all endpoints require authentication
    )
```
3. Add any new pydantic validation schemas as necessary:
```python
# src/backend/aspen/api/schemas/new_module.py
from aspen.api.schemas.base import BaseResponse, BaseRequest


class NewRequest(BaseRequest):
    foo: str

class NewResponseItem(BaseResponse):
    id: int
    bar: str

class NewResponseList(BaseResponse):
    rows: List[NewResponseItem]
```
4. Add endpoints to your view module.
```python
# src/backend/aspen/api/schemas/new_schemas.py
import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from aspen.api.auth import get_auth_user
from aspen.api.deps import get_db, get_settings
from aspen.api.schemas.new_module import NewRequest, NewResponseList
from aspen.api.settings import Settings
from aspen.database.models import User, SomeModel

router = APIRouter()


# Specify the HTTP method, sub-path (appending to the path added to main.py) and response model type.
# The response model type here populates our API documentation.
@router.get("/", response_model=NewResponseList) # All endpoints that return a list must end with a trailing slash
async def list_items(
    request: NewRequest, # GET requests often don't need input model validation, but this is here for completeness.
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    # If this endpoint requires authentication, we need to make sure to depend on get_auth_user
    # or get_admin_user here to validate the user's credentials and return 401/403 responses
    # if their credentials are invalid. For most endpoints, get_auth_user is added at the root
    # router in aspen/api/main.py, and it only needs to be included again here if we want to
    # *use* the user object in our endpoint.
    user: User = Depends(get_auth_user),
) -> NewResponseList:

    rows = (await db.execute(sa.select(SomeModel).filter(SomeModel.somefield == request.bar))).scalars().all()
    return NewResponseList.parse_obj({"rows": rows})

```




## Database concerns

### Interacting with the local database in sql

You can also connect to your local psql console by running:

```
aspen% make local-pgconsole
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
aspen% make local-dbconsole
docker-compose exec backend aspen-cli db --local interact
Python 3.9.1 (default, Feb  9 2021, 07:55:26)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.21.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: session = engine.make_session()

In [2]: session.query(User).all()
Out[2]: []

In [3]:
```

### Profiling SqlAlchemy queries

#### Interactive profiling

`aspen-cli db interact` has a `--profile` option that prints out every query that's executed and how long they take:

```
aspen% make local-dbconsole-profile
docker-compose exec backend aspen-cli db --local interact --profile
Python 3.9.1 (default, Feb  9 2021, 07:55:26)
Type 'copyright', 'credits' or 'license' for more information
IPython 7.21.0 -- An enhanced Interactive Python. Type '?' for help.

In [1]: session = engine.make_session()

In [2]: results = session.query(Sample).all()
DEBUG:sqltime:Start Query: SELECT aspen.samples.id AS aspen_samples_id, aspen.samples.submitting_group_id AS aspen_samples_submitting_group_id, aspen.samples.private_identifier AS aspen_samples_private_identifier, aspen.samples.original_submission AS aspen_samples_original_submission, aspen.samples.public_identifier AS aspen_samples_public_identifier, aspen.samples.sample_collected_by AS aspen_samples_sample_collected_by, aspen.samples.sample_collector_contact_email AS aspen_samples_sample_collector_contact_email, aspen.samples.sample_collector_contact_address AS aspen_samples_sample_collector_contact_address, aspen.samples.authors AS aspen_samples_authors, aspen.samples.collection_date AS aspen_samples_collection_date, aspen.samples.location AS aspen_samples_location, aspen.samples.division AS aspen_samples_division, aspen.samples.country AS aspen_samples_country, aspen.samples.organism AS aspen_samples_organism, aspen.samples.host AS aspen_samples_host, aspen.samples.purpose_of_sampling AS aspen_samples_purpose_of_sampling, aspen.samples.specimen_processing AS aspen_samples_specimen_processing
FROM aspen.samples
DEBUG:sqltime:Query Complete!
DEBUG:sqltime:Total Time: 0.012416

In [3]:
```

#### Profiling in code
We previously had nicer DB profiling in code, but it appears to have broken at some point. In the meantime, if you just need very, very basic profiling, you can just add an `echo=True` argument to whatever runs the ` create_engine()` call and then remove it when you're done. If you need something more complete, you'll probably want to fix the below. Also check out [these docs on SQLAlchemy](https://docs.sqlalchemy.org/en/14/faq/performance.html#query-profiling) for more guidance/context.

FIXME (Vince) As of Nov 14, 2022, the following does not appear to work. The code is present, but invoking `enable_profiling`, etc has no effect right now. We should fix that. --- OLD README: The module [`aspen.database.connection`](../../src/backend/aspen/database/connection.py) contains a number of methods to manage the capture of queries issued by sqlalchemy.  `enable_profiling()`/`disable_profiling()` can be used to enable and disable profiling, and `enable_profiling_ctx()` is a [context manager](https://docs.python.org/3/reference/compound_stmts.html#with) that can be used to manage a block of code that requires profiling.

### Autogeneration of schema migration

- after modifying/adding any database table/schema code run:
  - `make backend-alembic-autogenerate MESSAGE="descriptive message"`
- this will create a migration file under `src/backend/database_migrations`
  - make sure you look this file over and verify that alembic made the appropriate changes
- run `make backend-alembic-upgrade-head`
  - this updates your local running database, make sure you use either `make pg-console` or `make db-console` to check that changes were applied appropriately!

## Updating python dependencies

To update python dependencies, update the [`Pipfile`](../../Pipfile) and run `make update-deps`. This will update [`Pipfile.lock`](../../src/backend/Pipfile.lock) and [`requirements.txt`](../../src/backend/requirements.txt) (used by setup.py).
You will also need to rebuild local running docker containers by running `make local-rebuild`.

If you add a third-party library (directly or indirectly) that does not support [python typing](https://docs.python.org/3/library/typing.html), then you may need to add an entry to [`mypy.ini`](../../mypy.ini) to let mypy know [not to expect type hints for that library](https://mypy.readthedocs.io/en/stable/running_mypy.html#missing-type-hints-for-third-party-library).


## Adding new users to the staging/prod db:
Create a new user to the auth0 covidtracker tenet, take note of auth0 user id
* connect to staging aspen_db
  * `make remote-pgconsole ENV=<staging|prod> DB=aspen_db`

* execute insert sql:
  * ```sql
    aspen_db=> INSERT INTO users (name, email, auth0_user_id, group_admin, system_admin, group_id) VALUES ('<name>', '<email>', '<auth0 user ID>', 'f', 't', <group ID>);
    ```
    * to see all possible group ids:
      * `select * from groups;`

## How to use aspencli:
the cli is useful to call api endpoints through the terminal. To start using the cli you must be logged into rdev, staging, or prod with your aspen system admin account.

Example endpoint call to update public_ids based on private to public id mapping csv file (column headers must be named `private_identifier`,`public_identifier`, no line numbering)
* `python src/cli/aspencli.py --env <local|staging|prod|rdev> samples update_public_ids --group-id 1 --private-to-public-id-mapping ~/Downloads/test_rename_public_identifiers.csv`

  * if using rdev also specify the stack name with `--stack <stack-name>` flag
