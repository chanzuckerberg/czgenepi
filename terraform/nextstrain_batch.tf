variable "nextstrain-batch-params" {
  type  = map
  default = {
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
  user_data = base64encode(file("${path.module}/advanced_options/user_data.txt"))

}


resource "aws_batch_compute_environment" "nextstrain-compute-environment" {
  compute_environment_name = "aspen-nextstrain"

  compute_resources {
    instance_role = aws_iam_instance_profile.nextstrain-ecs-instance-role.arn
    allocation_strategy = "BEST_FIT"
    # TODO: create common ec2 key
    ec2_key_pair = "phoenix"

    instance_type = [
      "m5",
    ]

    max_vcpus = 128
    min_vcpus = 0
    desired_vcpus = 0

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
  depends_on   = [
    aws_iam_role_policy_attachment.nextstrain-batch-service-role
  ]

}


resource "aws_batch_job_queue" "nextstrain_job_queue" {
  name     = "aspen-nextstrain"
  state    = "ENABLED"
  priority = 1
  compute_environments = [
    aws_batch_compute_environment.nextstrain-compute-environment.arn,
  ]
}
