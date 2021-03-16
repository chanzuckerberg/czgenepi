variable "batch_params" {
  type  = map
  default = {
    retry_strategy = 1
    timeout = 14400
  }
}

resource "aws_batch_job_definition" "nextstrain-job-definition" {
  name = "nextstrain-job"
  type = "container"
  parameters = var.batch_params

  container_properties = templatefile("${path.module}/batch/job_container_properties.json", {
    JOB_ROLE_ARN = aws_iam_role.nextstrain-jobs-role.arn
  })
}
