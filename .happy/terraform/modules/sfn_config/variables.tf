variable app_name {
  type        = string
  description = "Application name"
}

variable image {
  type        = string
  description = "Image URL"
}

variable memory {
  type        = number
  description = "How much memory to allocate to the batch job"
}

variable wdl_path {
  type        = string
  description = "Path to the wdl file that should be invoked relative to this git checkout"
}

variable stack_resource_prefix {
  type        = string
  description = "namespace for this stack"
}

variable remote_dev_prefix {
  type        = string
  description = "Resource prefix for this stack"
}

variable swipe_wdl_bucket {
  type        = string
  description = "Bucket for swipe wdl storage"
}

variable swipe_comms_bucket {
  type        = string
  description = "Bucket for swipe comms storage"
}

variable custom_stack_name {
  type        = string
  description = "Please provide the stack name"
}

variable schedule_expressions {
  type        = list(string)
  description = "list of strings to use for triggering a SFN on a schedule. ex: [\"cron(0 0 ? * 1-5 *)\"]"
  default     = []
}

variable event_role_arn {
  type        = string
  description = "Role ARN to use to trigger a scheduled SFN"
  default     = ""
}

variable sfn_arn {
  type        = string
  description = "ARN of the SFN to invoke on a schedule"
  default     = ""
}

variable deployment_stage {
  type        = string
  description = "The name of the deployment stage of the Application"
  default     = "dev"
}

variable extra_args {
  type = map(string)
  description = "some stuff"
  default = {}
}
