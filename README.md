# ASPEN

This repository contains the code for the gen-epi project.


## Running the app in development mode: 

```bash
aspen% npm --prefix src/ts start
aspen% export FLASK_APP=aspen.app
aspen% export FLASK_ENV=development
aspen% cd src/py
aspen% flask run --host localhost --port 3000  # host and port needed for auth0
```

## Backend

The backend is documented [here](docs/backend/).


## Frontend

The frontend is documented [here](docs/frontend/).
