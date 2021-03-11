terraform {
  required_version = ">= 0.14.3"
  required_providers {
    aws = "~> 3.29"
  }
  backend "s3" {
    region = "us-west-2"
  }
}

variable "db_credentials" {
  type = object({
    admin_username = string
    admin_password = string
    rw_username = string
    rw_password = string
    ro_username = string
    ro_password = string
  })
}

variable "connect_db_password" {
  type = string
  default = "NOT_SET"
  sensitive = true
}

module "aspen" {
  source = "./terraform"
  db_credentials = var.db_credentials
  connect_db_password = var.connect_db_password
}

output "aspen" {
  value = module.aspen
}
