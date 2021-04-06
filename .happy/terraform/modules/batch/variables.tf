variable stack_resource_prefix {
  type        = string
  description = "Prefix for account-level resources"
}

variable app_name {
  type        = string
  description = "Batch app name"
}

variable image {
  type        = string
  description = "Image name"
}

variable batch_role_arn {
  type        = string
  description = "ARN for the role assumed by tasks"
}

variable cmd {
  type        = string
  description = "Command to run"
  default     = ""
}

variable custom_stack_name {
  type        = string
  description = "Please provide the stack name"
}

variable remote_dev_prefix {
  type        = string
  description = "S3 storage path / db schema prefix"
  default     = ""
}

variable deployment_stage {
  type        = string
  description = "The name of the deployment stage of the Application"
}

variable frontend_url {
  type        = string
  description = "url for the frontend app"
}
