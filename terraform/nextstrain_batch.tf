variable "nextstrain-batch-params" {
  type  = map
  default = {
    retry_strategy = 1
    timeout = 14400
  }
}

resource "aws_batch_job_definition" "nextstrain-job-definition" {
  name = "nextstrain-job-definition"
  type = "container"
  parameters = var.nextstrain-batch-params

  container_properties = <<CONTAINER_PROPERTIES
{
    "command": [],
    "image": "nextstrain/base:latest",
    "memory": 1024,
    "vcpus": 1,
    "jobRoleArn": "${aws_iam_role.nextstrain-jobs-role.arn}"
}
CONTAINER_PROPERTIES
}

# resources below needed for compute environment

resource "aws_iam_role" "nextstrain-ecs-instance-role" {
  name = "nextstrain_ecs_instance_role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ecs", "ec2"]
  })
}


resource "aws_iam_role_policy_attachment" "nextstrain-ecs-instance-role" {
  role       = aws_iam_role.nextstrain-ecs-instance-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}


resource "aws_iam_instance_profile" "nextstrain-ecs-instance-role" {
  name = "nextstrain_ecs_instance_profile"
  role = aws_iam_role.nextstrain-ecs-instance-role.name
}


resource "aws_iam_role" "nextstrain-batch-service-role" {
  name = "nextstrain_aws_batch_service_role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["batch"]
  })
}


resource "aws_iam_role_policy_attachment" "nextstrain-batch-service-role" {
  role       = aws_iam_role.nextstrain-batch-service-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}


resource "aws_security_group" "nextstrain-batch-security-group" {
  name = "nextstrain_aws_batch_compute_environment_security_group"
  description = "security group for nextstrain batch"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_vpc" "nextstrain-batch-vpc" {
  cidr_block = "10.1.0.0/16"
}


resource "aws_subnet" "nextstrain-batch-subnet" {
  vpc_id     = aws_vpc.nextstrain-batch-vpc.id
  cidr_block = "10.1.1.0/24"
}


resource "aws_batch_compute_environment" "nextstrain-batch-compute-environment" {
  compute_environment_name = "nextstrain-batch-compute-environment"

  compute_resources {
    instance_role = aws_iam_instance_profile.nextstrain-ecs-instance-role.arn

    instance_type = [
      "c4.large",
    ]

    max_vcpus = 64
    min_vcpus = 0

    security_group_ids = [
      aws_security_group.nextstrain-batch-security-group.id,
    ]

    subnets = [
      aws_subnet.nextstrain-batch-subnet.id,
    ]

    type = "EC2"
  }

  service_role = aws_iam_role.nextstrain-batch-service-role.arn
  type = "MANAGED"
  depends_on   = [aws_iam_role_policy_attachment.nextstrain-batch-service-role]
}


resource "aws_batch_job_queue" "nextstrain_batch_job_queue" {
  name     = "nextstrain-batch-job-queue"
  state    = "ENABLED"
  priority = 1
  compute_environments = [
    aws_batch_compute_environment.nextstrain-batch-compute-environment.arn,
  ]
}
