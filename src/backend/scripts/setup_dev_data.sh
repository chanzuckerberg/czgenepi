#!/bin/bash
export AWS_REGION=us-west-2
export AWS_DEFAULT_REGION=us-west-2
export AWS_ACCESS_KEY_ID=nonce
export AWS_SECRET_ACCESS_KEY=nonce

export FRONTEND_URL=http://frontend.genepinet.local:8000
export BACKEND_URL=http://backend.genepinet.local:3000

# NOTE: This script is intended to run INSIDE the dockerized dev environment!
# If you need to run it directly on your laptop for some reason, change
# localstack below to localhost
export LOCALSTACK_URL=http://localstack.genepinet.local:4566

# How the backend can reach the OIDC idp
export OIDC_INTERNAL_URL=http://oidc.genepinet.local
# How a web browser can reach the OIDC idp
export OIDC_BROWSER_URL=https://oidc.genepinet.local:8443

echo "Creating secretsmanager secrets"
local_aws="aws --endpoint-url=${LOCALSTACK_URL}"
${local_aws} secretsmanager create-secret --name aspen-config &> /dev/null || true
${local_aws} secretsmanager update-secret --secret-id aspen-config --secret-string '{
  "AUTH0_CLIENT_ID": "local-client-id",
  "AUTH0_CALLBACK_URL": "'"${BACKEND_URL}"'/callback",
  "AUTH0_CLIENT_SECRET": "local-client-secret",
  "AUTH0_DOMAIN": "oidc.genepinet.local:8443",
  "AUTH0_BASE_URL": "'"${OIDC_INTERNAL_URL}"'",
  "AUTH0_USERINFO_URL": "connect/userinfo",
  "AUTH0_ACCESS_TOKEN_URL": "'"${OIDC_INTERNAL_URL}"'/connect/token",
  "AUTH0_AUTHORIZE_URL": "'"${OIDC_BROWSER_URL}"'/connect/authorize",
  "AUTH0_CLIENT_KWARGS": {"scope": "openid profile email offline_access"},
  "FLASK_SECRET": "DevelopmentKey",
  "DB_rw_username": "user_rw",
  "DB_rw_password": "password_rw",
  "DB_address": "database.genepinet.local",
  "S3_external_auspice_bucket": "aspen-external-auspice-data"
}' || true

echo "Creating SSM Parameter"
${local_aws} ssm put-parameter --name /aspen/local/localstack/nextstrain-ondemand-sfn --value '{
  "Input":{
    "Run":{
      "aspen_config_secret_name":"aspen-config",
      "aws_region":"us-west-2",
      "docker_image_id":"aspen-nextstrain",
      "remote_dev_prefix":""}
    },
  "OutputPrefix":"s3://aspen-batch/nextstrain-ondemand-sfn/results",
  "RUN_WDL_URI":"s3://aspen-batch/nextstrain-ondemand.wdl-v0.0.1.wdl",
  "RunEC2Memory":64000,
  "RunEC2Vcpu":10,
  "RunSPOTMemory":64000,
  "RunSPOTVcpu":10
}'

echo "Creating IAM role"
${local_aws} iam create-role --role-name sfnrole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "states.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

echo "Creating SFN"
${local_aws} stepfunctions create-state-machine --name nextstrain-sfn --role-arn arn:aws:iam::000000000000:role/sfnrole --definition '{"Comment":"SWIPE single-wdl pipeline entry point","StartAt":"PreprocessInput","States":{"HandleFailure":{"End":true,"OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-handle-failure","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"HandleSuccess":{"End":true,"OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-handle-success","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"PreprocessInput":{"Next":"RunSPOT","OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-preprocess-input","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"RunDetectError":{"Choices":[{"Next":"RunEC2","StringMatches":"Host EC2 (instance i-*) terminated.","Variable":"$.BatchJobError.RunSPOT.Cause.StatusReason"}],"Default":"RunReadOutput","Type":"Choice"},"RunEC2":{"Catch":[{"ErrorEquals":["States.ALL"],"Next":"RunReadOutput","ResultPath":"$.BatchJobError.RunEC2"}],"Next":"RunReadOutput","Parameters":{"ContainerOverrides":{"Environment":[{"Name":"AWS_DEFAULT_REGION","Value":"us-west-2"},{"Name":"REMOTE_DEV_PREFIX","Value":"/sfn-exec"},{"Name":"DEPLOYMENT_STAGE","Value":"rdev"},{"Name":"WDL_INPUT_URI","Value.$":"$.RUN_INPUT_URI"},{"Name":"WDL_WORKFLOW_URI","Value.$":"$.RUN_WDL_URI"},{"Name":"WDL_OUTPUT_URI","Value.$":"$.RUN_OUTPUT_URI"},{"Name":"SFN_EXECUTION_ID","Value.$":"$$.Execution.Id"},{"Name":"SFN_CURRENT_STATE","Value.$":"$$.State.Name"}],"Memory.$":"$.RunEC2Memory","Vcpus.$":"$.RunEC2Vcpu"},"JobDefinition":"aspen-rdev-sfn-exec-swipe","JobName.$":"$$.Execution.Name","JobQueue":"arn:aws:batch:us-west-2:000000000000:job-queue/rdev-aspen-batch-EC2","Timeout":{"AttemptDurationSeconds":36000}},"Resource":"arn:aws:states:::batch:submitJob.sync","ResultPath":"$.BatchJobDetails.Run","Retry":[{"BackoffRate":2,"ErrorEquals":["Batch.AWSBatchException"],"IntervalSeconds":15,"MaxAttempts":3}],"Type":"Task"},"RunGetCause":{"Next":"RunDetectError","Parameters":{"Cause.$":"States.StringToJson($.BatchJobError.RunSPOT.Cause)"},"ResultPath":"$.BatchJobError.RunSPOT","Type":"Pass"},"RunReadOutput":{"Catch":[{"ErrorEquals":["States.ALL"],"Next":"HandleFailure"}],"Next":"HandleSuccess","OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-process-stage-output","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"RunSPOT":{"Catch":[{"ErrorEquals":["States.ALL"],"Next":"RunGetCause","ResultPath":"$.BatchJobError.RunSPOT"}],"Next":"RunReadOutput","Parameters":{"ContainerOverrides":{"Environment":[{"Name":"AWS_DEFAULT_REGION","Value":"us-west-2"},{"Name":"REMOTE_DEV_PREFIX","Value":"/sfn-exec"},{"Name":"DEPLOYMENT_STAGE","Value":"rdev"},{"Name":"WDL_INPUT_URI","Value.$":"$.RUN_INPUT_URI"},{"Name":"WDL_WORKFLOW_URI","Value.$":"$.RUN_WDL_URI"},{"Name":"WDL_OUTPUT_URI","Value.$":"$.RUN_OUTPUT_URI"},{"Name":"SFN_EXECUTION_ID","Value.$":"$$.Execution.Id"},{"Name":"SFN_CURRENT_STATE","Value.$":"$$.State.Name"}],"Memory.$":"$.RunSPOTMemory","Vcpus.$":"$.RunSPOTVcpu"},"JobDefinition":"aspen-rdev-sfn-exec-swipe","JobName.$":"$$.Execution.Name","JobQueue":"arn:aws:batch:us-west-2:000000000000:job-queue/rdev-aspen-batch-SPOT","Timeout":{"AttemptDurationSeconds":36000}},"Resource":"arn:aws:states:::batch:submitJob.sync","ResultPath":"$.BatchJobDetails.Run","Retry":[{"BackoffRate":2,"ErrorEquals":["Batch.AWSBatchException"],"IntervalSeconds":15,"MaxAttempts":3}],"Type":"Task"}},"TimeoutSeconds":259200}'

echo "Creating s3 buckets"
${local_aws} s3api head-bucket --bucket aspen-external-auspice-data || ${local_aws} s3 mb s3://aspen-external-auspice-data
${local_aws} s3api head-bucket --bucket aspen-batch || ${local_aws} s3 mb s3://aspen-batch
echo
echo "Dev env is up and running!"
echo "  Frontend: ${FRONTEND_URL}"
echo "  Backend: ${BACKEND_URL}"
