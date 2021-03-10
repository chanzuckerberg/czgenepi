deploy-tf: environment-set init-tf
	terraform apply

environment-set:
	@[ "$(DEPLOYMENT_ENVIRONMENT)" != "" ] || { echo "Please run \"source environment\" in the repo root directory before running terraform commands"; exit 1; }

init-tf:
	-rm -f $(TF_DATA_DIR)/*.tfstate
	mkdir -p $(TF_DATA_DIR)
	jq -n ".region=\"us-west-2\" | .bucket=env.TF_S3_BUCKET | .key=env.APP_NAME+env.DEPLOYMENT_ENVIRONMENT" > $(TF_DATA_DIR)/aws_config.json
	terraform init

.PHONY: deploy-tf init-tf
