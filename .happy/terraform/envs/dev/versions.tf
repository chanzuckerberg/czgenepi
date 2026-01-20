terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.45"
    }
  }

  backend "s3" {
    region  = "us-west-2"
    bucket  = "genepi-prod-s3-tf-state-prod-prod-genepi-theia-stacks-state"
    key     = "czgenepi-dev.tfstate"
    profile = "theia"
    encrypt = "true"

    dynamodb_table = "genepi-prod-s3-tf-state-prod-prod-genepi-theia-stacks-state-lock"
  }
}