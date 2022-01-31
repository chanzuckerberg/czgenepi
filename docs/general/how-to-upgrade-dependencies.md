# How to Upgrade Dependencies
(largely cribbed from [single cell dependency upgrade doc](https://github.com/chanzuckerberg/single-cell/blob/main/how-we-work/how-to-upgrade-dependencies.md))

Once a month at the beginning of the month, the oncall engineer should visit the current versions of package dependencies that we have for both the frontend (`npm`) and the backend (`poetry`) for `CZ Gen Epi`. We do this so that we keep up to date with any security vulnerabilities that may exist in older versions and so that we don't end up too out-of-date with improvements that occur in our dependencies causing forward-incompatibility. The sections below describe the policies and instructions for each subset of our product suite.

As a general rule please do not directly import the latest version of the downstream package that contains the vulnerability. For example, if we import package `A` and package `A` depends on package `B` which depends on package `C` which contains a vulnerability, please do not directly import the latest version of package `C` directly into our package. If a newer version of package `A` exists where they have addressed the vulnerability, directly upgrade `A`. Otherwise, wait until there is a new one available.

If we run into a case where an immediate upstream dependency does not address the vulnerability in a timely manner (i.e. package `C` becomes abandonware), please file an issue noting the problem and start tracking the likely resolution (i.e. migrate to a new dependency, wait, safely ignore, etc.). Please bring the issue to attention for triage during the next issue refinement meeting.

Please check the repos' Dependabot Alerts to ensure that all alerts have been addressed. Please do not clear the alerts unless they are either addressed (via a fully merged PR) or they are not relevant. This means that if one of our dependency packages is unable to be updated because of no available upgrade, leave the alert open so we know to update the package later once an update is available. The dependabot alerts can be found [here](https://github.com/chanzuckerberg/czgenepi/security/dependabot).


### Upgrading CZ Gen Epi frontend

When upgrading the frontend package dependencies, please upgrade to the latest _compatible_ version of a dependency. For example, if we are incompatible with a major update, please upgrade to the latest _minor_ version and read below for guidelines on updating the major version at a later point in time.

There are two commands to run to figure out which npm packages to upgrade:

`npm audit` -- this command generates a report of known vulnerabilities in dependencies described in `src/frontend/package.json`.

`npm outdated` -- this command generates a report of all dependencies in `src/frontend/package.json` and whether there are newer versions available.

For major upgrades: check the package's changelog, especially the breaking changes section first to see if such an upgrade is straightforward. If so, feel free to push the upgrade and make sure the affected functionalities still work. If breaking changes exist, please exercise more caution when updating the package to ensure that all affected functionality still operates as expected; feel free to recruit manual testing support from the larger team to ensure that the application doesn't break.

For minor and patch upgrade: In theory there should not be any breaking changes, so just upgrading the packages should not break anything.

**Important Note**: not all packages follow semantic versioning, so please notice what packages have been upgraded in `package.json` and test their related functionality accordingly to ensure everything is fine.

Run the two above commands and upgrade packages to the latest available (that do not contain a security vulnerability). Please double check that the frontend still works as expected and is not using outdated references. Finally, before committing the updates, please rebuild `package-lock.json` by first deleteing `package-lock.json` and `node_modules` and then running `npm i` to generate the new `package-lock.json`.

[Here](https://github.com/chanzuckerberg/cellxgene/pull/2167/files) is a sample PR that upgraded several frontend npm dependencies (example PR from our friends at cellxgene).

#### Other useful tools

Besides `npm audit` and `npm outdated`, you may take a look at [`npm-check`](https://www.npmjs.com/package/npm-check), [`npm-ls`](https://docs.npmjs.com/cli/v7/commands/npm-ls), and [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates) as tools to help upgrade packages to the latest version.
