terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.45"
    }
  }

  backend "s3" {
    region   = "us-west-2"
    bucket   = "genepi-prod-s3-tf-state-prod-prod-genepi-stacks-state"
    key      = "terraform.tfstate"
    role_arn = "arn:aws:iam::829407189049:role/tfe-si"
    encrypt  = "true"

    dynamodb_table = "genepi-prod-s3-tf-state-prod-prod-genepi-stacks-state-lock"
  }
}