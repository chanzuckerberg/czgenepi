variable stack_resource_prefix {
  type        = string
  description = "Prefix for account-level resources"
}

variable swipe_image {
  type        = string
  description = "ECR path to the swipe image"
}

variable app_name {
  type        = string
  description = "Batch workflow name (job definition suffix)"
}

variable image {
  type        = string
  description = "Image name"
}

variable batch_role_arn {
  type        = string
  description = "ARN for the role assumed by tasks"
}

variable custom_stack_name {
  type        = string
  description = "Please provide the stack name"
}

variable remote_dev_prefix {
  type        = string
  description = "Remote Dev namespace (db schema prefix)"
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
