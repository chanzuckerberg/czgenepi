resource "aws_iam_policy" "aspen_batch_main_job" {
  name = "aspen-${var.DEPLOYMENT_ENVIRONMENT}-batch-job"
  policy = templatefile("${path.module}/iam_policy_templates/batch_job.json", {
    AWS_DEFAULT_REGION     = var.AWS_DEFAULT_REGION,
    AWS_ACCOUNT_ID         = var.AWS_ACCOUNT_ID,
    DEPLOYMENT_ENVIRONMENT = var.DEPLOYMENT_ENVIRONMENT,
  })
}

resource "aws_iam_role" "aspen_batch_main_job" {
  name = "aspen-${var.DEPLOYMENT_ENVIRONMENT}-batch-job"
  assume_role_policy = templatefile("${path.module}/iam_policy_templates/trust_policy.json", {
    trust_services = ["ecs-tasks"]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "aspen_batch_main_job" {
  role       = aws_iam_role.aspen_batch_main_job.name
  policy_arn = aws_iam_policy.aspen_batch_main_job.arn
}

resource "aws_iam_role_policy_attachment" "aspen_batch_main_job_ecr_readonly" {
  role       = aws_iam_role.aspen_batch_main_job.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_batch_job_definition" "aspen_main" {
  name = "aspen-${var.DEPLOYMENT_ENVIRONMENT}-main"
  type = "container"
  retry_strategy {
    attempts = 1
  }
  timeout {
    attempt_duration_seconds = 86400
  }
  container_properties = templatefile("${path.module}/batch_job_container_properties.json", {
    batch_job_role_arn     = aws_iam_role.aspen_batch_main_job.arn,
    # batch_docker_image     = "${var.DOCKER_REGISTRY}/aspen"
    batch_docker_image     = "ubuntu:20.04",
    aws_region             = var.AWS_DEFAULT_REGION,
    deployment_environment = var.DEPLOYMENT_ENVIRONMENT
  })
}
