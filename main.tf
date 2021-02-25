terraform {
  required_version = ">= 0.14.3"
  required_providers {
    aws = "~> 3.29"
  }
  backend "s3" {
    region = "us-west-2"
  }
}

module "mccloud" {
  source = "./terraform"
}

output "mccloud" {
  value = module.mccloud
}
