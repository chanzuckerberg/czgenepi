#!/bin/bash


export AWS_DEFAULT_REGION=us-west-2

aspen-cli db --remote import-covidhub-users --covidhub-db-secret 'covidhub-staging-db' --rr-project-id 'RR066e'