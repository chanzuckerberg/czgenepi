# ASPEN

This repository contains the code for the gen-epi project.


## Setting up a development environment

### Backend

#### Installing the python dependencies

1. Create a python virtual environment and activate it.  While other installation modes may be possible, this is the only tested development mode.
```bash
aspen% python3.7 -m venv .venv
aspen% . .venv/bin/activate
(.venv) aspen%
```
2. Install pipenv.
```bash
(.venv) aspen% pip install pipenv
(.venv) aspen%
```
3. Install the packages required for development.
```bash
(.venv) aspen% pipenv install --dev
```

### Running the app in development mode:

```bash
(.venv) aspen% npm --prefix src/ts start
(.venv) aspen% export FLASK_APP=aspen.app
(.venv) aspen% export FLASK_ENV=development
(.venv) aspen% cd src/py
(.venv) aspen% flask run --host localhost --port 3000  # host and port needed for auth0
```

## Backend

The backend is documented [here](docs/backend/).


## Frontend

The frontend is documented [here](docs/frontend/).
