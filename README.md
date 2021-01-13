# COVIDR

This repository contains the code for the gen-epi project.

## Deployment of the python web services

1. Set up a virtual environment and activate it.
```bash
% python -V
Python 3.7.6
% python3.7 -m venv .venv
% source .venv/bin/activate
```
2. Install the requirements for the python package.
```bash
% pip install -r src/py/requirements.txt
```
3. Install awsebcli.
```bash
% pip install awsebcli
```
4. Set up the elastic beanstalk configuration.
```bash
% eb init --region=us-west-2 --platform python-3.7 covidr
```
5. Deploy the code.  You should deploy to the `covidr-staging` environment.
```bash
% eb deploy covidr-staging
```
