## The Stack

The frontend is written in [TypeScript](https://www.typescriptlang.org/), using the [React](https://reactjs.org/) framework. Files are packaged for server use via a [Webpack](https://webpack.js.org/) pipeline.

## Setting up a development environment

### Install Node

The only prerequisite for working with the frontend is [Node](https://nodejs.org/en/). We aim to use the latest Active LTS release (14.15.4). It can either be installed using [nvm](#nvm) or [nodeenv](#nodeenv).

#### nvm

[nvm](https://github.com/nvm-sh/nvm) is a great way to install and manage Node.

From the **project root directory**:

1. Install nvm
```zsh
% curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```

2. Install Node
```zsh
% nvm install
% nvm use
```

#### nodeenv

[nodeenv](https://github.com/ekalinin/nodeenv) is an alternative way to install Node in a python virtual environment.

From the **project root directory**:

1. Activate your virtual environment.
```bash
% . .venv/bin/activate
```

2. Install nodeenv into your virtual environment.
```bash
(venv) % pip install nodeenv
```

3. Install the desired version of Node.
```bash
(venv) % nodeenv --force --node=$(cat .nvmrc) .venv
```

### Install dependencies

Once Node is installed, install the dependencies for transpiling the Typescript code.

1. Install dependencies
```zsh
% npm --prefix src/ts install
```

## Running in development mode

1. Start Webpack in dev mode (watches for file changes)
```zsh
% npm --prefix src/ts start
```

That's it! Output files will automatically appear in the `static` folder of the Flask app (src/py/aspen/static). React hot reloading is not supported, so a browser refresh is required to see updated content.

## Linting / Style

```zsh
% npm --prefix src/ts run style
```
This will style and lint your code using the project's settings.

## Deployment

Once the source code has been placed on the target machine, but before the backend is started, the following command should be run:

```zsh
% npm --prefix src/ts run build
```

This creates a minimized production build and places it in the previously mentioned static folder.
