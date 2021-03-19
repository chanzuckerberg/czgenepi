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
    trust_services = ["ec2"]
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


data "aws_availability_zones" "available" {}


resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [aws_default_vpc.default.id]
  }
}

resource "aws_default_route_table" "default" {
  default_route_table_id = aws_default_vpc.default.default_route_table_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = data.aws_internet_gateway.default.id
  }

  tags = {
    Name = "Default Route Table"
  }
}


resource "aws_default_subnet" "default" {
  count = length(split(",", join(",", flatten(data.aws_availability_zones.available.*.names))))

  availability_zone = data.aws_availability_zones.available.names[count.index]
}


resource "aws_security_group" "nextstrain-batch-security-group" {
  name = "nextstrain_aws_batch_compute_environment_security_group"
  description = "security group for nextstrain batch"
  vpc_id = aws_default_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# resource "aws_cloudwatch_log_group" "nextstrain-log-group" {
#   name = "/aws/batch/job"
#   retention_in_days = 60
# }


# for increased disk space
resource "aws_launch_template" "nextstrain-launch-template" {
  name = "nextstrain-launch-template"

  block_device_mappings {
    device_name = "/dev/xvdcz"

    ebs {
      volume_size = 200
      volume_type = "gp2"
      delete_on_termination = true
    }
  }
  user_data = base64encode(file("${path.module}/data/user_data.txt"))

}


resource "aws_batch_compute_environment" "nextstrain-compute-environment" {
  compute_environment_name = "aspen-nextstrain"

  compute_resources {
    instance_role = aws_iam_instance_profile.nextstrain-ecs-instance-role.arn
    allocation_strategy = "BEST_FIT"
    ec2_key_pair = "phoenix"

    instance_type = [
      "m5.2xlarge",
    ]

    max_vcpus = 128
    min_vcpus = 8
    desired_vcpus = 8

    security_group_ids = [
      aws_security_group.nextstrain-batch-security-group.id,
    ]

    subnets = aws_default_subnet.default.*.id

    type = "EC2"

    launch_template {
      launch_template_id = aws_launch_template.nextstrain-launch-template.id
    }
  }

  service_role = aws_iam_role.nextstrain-batch-service-role.arn
  type = "MANAGED"
  depends_on   = [aws_iam_role_policy_attachment.nextstrain-batch-service-role]

}


resource "aws_batch_job_queue" "nextstrain_job_queue" {
  name     = "aspen-nextstrain"
  state    = "ENABLED"
  priority = 1
  compute_environments = [
    aws_batch_compute_environment.nextstrain-compute-environment.arn,
  ]
}
