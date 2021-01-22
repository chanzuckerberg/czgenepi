# COVIDR

This repository contains the code for the gen-epi project.


## Running the app in development mode: 

```bash
covidr% npm --prefix src/ts start
covidr% export FLASK_APP=covidr.app
covidr% export FLASK_ENV=development
covidr% cd src/py
covidr% flask run --host localhost --port 3000  # host and port needed for auth0
```

## Backend

The backend is documented [here](docs/backend/).


## Frontend

The frontend is documented [here](docs/frontend/).
