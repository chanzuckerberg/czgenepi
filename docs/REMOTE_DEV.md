# Happy Remote Development Environment

#### Note: remote dev is still somewhat experimental. Work with #team-happy if you run into trouble.

## Install / configure dependencies
1. Please see the "Required Software" section of [DEV_ENV.md](../docs/DEV_ENV.md)

### Overview
Each engineer can run as many remote development *stacks* as they like. Each stack can represent a feature branch, experiment, or whatever's useful to you. Stacks are managed using the remote dev cli utility called `happy`.

The general remote dev workflow is:

1. Make some code changes
1. Run `happy create <your-stack-name>` to create a new stack (note: some special characters including underscores are not supported)
1. Visit the URL printed by the create step, share it with the team, etc.
1. Run `happy logs <your-stack-name> backend` to tail the logs of the aspen api.
1. Make some more code changes
1. Run `happy update <your-stack-name>` to update the remote stack with your latest changes.
1. When you don't need your stack anymore, run `happy delete <your-stack-name>` to free up remote dev resources.
1. Run `happy shell <your-stack-name> backend` to ssh into an ecs backend container for debugging

If you forget which stacks you've created, just run `happy list` at any time to list the current remote dev stacks.

If you need to reset your remote dev stack DB run `happy migrate <your-stack-name> --reset`.

### Slices
If you're only working on a subset of the CZ Gen Epi application, there's no need to build and push all docker images to test your changes in remote-dev. Both `happy create` and `happy update` commands support a `--slice` option that uses the latest `trunk` build of all docker images except the ones you're working on. For example, if you're only making changes to the frontend/backend images, you don't care to build & push the gisaid image. The following command will create an rdev with your changes reflected in only the `frontend` and `backend` images:

```
happy create mynewrdev --slice fullstack
```

The currently supported slices are:

| slice name  | images |
| ----------- | ------ |
| frontend | frontend |
| backend | backend |
| fullstack | frontend, backend |
| batch | nextsttrain, pangolin, gisaid |
| nextstrain | nextsttrain |
| gisaid | gisaid |
| pangolin | pangolin |

### Connecting to remote dev databases
NOTE - You'll need to [install and configure blessclient](https://czi.atlassian.net/wiki/spaces/SI/pages/1779598774/Install+BlessClient) first!

From the root of this repo, run `make remote-dbconsole DB=STACK_NAME_HERE` (replace STACK_NAME_HERE with the name of your stack!) to open a psql console on the remote dev db, or `make remote-pgconsole DB=STACK_NAME_HERE` to get a python console connected to the remote dev db.

### General CLI Usage
The CLI utility is evolving rapidly, so the best reference for which commands are available and how to use them is the CLI itself. All commands support a `--help` flag to print usage docs. For example:

```
% happy create --help
Usage: happy create [OPTIONS] STACK_NAME

  Create a dev stack with a given tag

Options:
  --tag TEXT          Tag name for docker image. Leave empty to generate one
                      automatically.
  --wait / --no-wait  wait for this to complete
  --help              Show this message and exit.
```

### Remote Dev Database management
There are two commands in the CZ Gen Epi CLI that exist specifically to enable management of remote dev environments: `aspen-cli db --remote setup` and `aspen-cli db --remote drop`. The `setup` command is responsible for creating a new database in our Aurora database, and importing a db snapshot into the new database. The `drop` command drops a database when a remote dev stack is deleted.

### GitHub Action Integration
A new stack can also be deployed to remote development environment through GitHub Action integration. Pushing any branch prefixed with "rdev-" will trigger the GH Action workflow to create or update a dev stack, with the stack name equals the part of branch name following the prefix, e.g. pushing branch "rdev-my-dev-branch" will deploy the stack "my-dev-branch" in the remote dev enviroment. This is useful in situation where local connections is slow.

### Authentication
The backend of Happy uses CZI's deployment of Terraform Enterprise (TFE) to deploy and track the resources
for the stacks. This requires logging into TFE to get a long-lived token tied to your user.
The first time you run the happy application, the prompt will give you a command to run to get a token;
follow its prompts.

The long-lived token's access to Terraform Enterprise will periodically expire. The happy CLI will let
you know when this happens, and give you instruction to access the TFE website in your
browser. Loading any TFE web page will reauthorize your token, and you can then re-run your command.

### Warnings

1. Stack name needs to be a valid DNS prefix: starts with a letter, only includes letters, numbers, and dashes, less than 64 characters in length.
1. Yes, you have access to manipulate your teammates' remote dev stacks. This is intentional, to enable collaboration on features. Please use responsibly.
