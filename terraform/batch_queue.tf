locals {
  launch_template_user_data_file = "${path.module}/container_instance_user_data"
  launch_template_user_data_hash = filemd5(local.launch_template_user_data_file)
}

data "aws_ssm_parameter" "mccloud_batch_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_iam_role" "mccloud_batch_service_role" {
  name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-batch-service"
  assume_role_policy = templatefile("${path.module}/iam_policy_templates/trust_policy.json", {
    trust_services = ["batch"]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "mccloud_batch_service_role" {
  role       = aws_iam_role.mccloud_batch_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

resource "aws_iam_role" "mccloud_batch_spot_fleet_service_role" {
  name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-batch-spot-fleet-service"
  assume_role_policy = templatefile("${path.module}/iam_policy_templates/trust_policy.json", {
    trust_services = ["spotfleet"]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "mccloud_batch_spot_fleet_service_role" {
  role       = aws_iam_role.mccloud_batch_spot_fleet_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

resource "aws_iam_role" "mccloud_batch_main_instance_role" {
  name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-batch-main-instance"
  assume_role_policy = templatefile("${path.module}/iam_policy_templates/trust_policy.json", {
    trust_services = ["ec2"]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "mccloud_batch_main_instance_role_put_metric" {
  role       = aws_iam_role.mccloud_batch_main_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "mccloud_batch_main_instance_role_ecs" {
  role       = aws_iam_role.mccloud_batch_main_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "mccloud_batch_main_instance_role_ssm" {
  role       = aws_iam_role.mccloud_batch_main_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "mccloud_batch_main" {
  name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-batch-main"
  role = aws_iam_role.mccloud_batch_main_instance_role.name
}

resource "aws_launch_template" "mccloud_batch_main" {
  # AWS Batch pins a specific version of the launch template when a compute environment is created.
  # The CE does not support updating this version, and needs replacing (redeploying) if launch template contents change.
  # The launch template resource increments its version when contents change, but the compute environment resource does
  # not recognize this change. We bind the launch template name to user data contents here, so any changes to user data
  # will cause the whole launch template to be replaced, forcing the compute environment to pick up the changes.
  name      = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-batch-main-${local.launch_template_user_data_hash}"
  user_data = filebase64(local.launch_template_user_data_file)
  tags      = local.common_tags
}

resource "aws_key_pair" "mccloud_batch" {
  key_name   = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}"
  public_key = var.SSH_PUBLIC_KEY
}

# See https://github.com/hashicorp/terraform-provider-aws/pull/16819 for Batch Fargate CE support
resource "aws_batch_compute_environment" "mccloud_ec2_spot" {
  compute_environment_name_prefix = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-ec2-spot-"

  compute_resources {
    instance_role = aws_iam_instance_profile.mccloud_batch_main.arn
    instance_type = ["r5d"]
    image_id      = data.aws_ssm_parameter.mccloud_batch_ami.value
    ec2_key_pair  = aws_key_pair.mccloud_batch.id
    min_vcpus     = 0
    desired_vcpus = 16
    max_vcpus     = 256
    security_group_ids = [
      aws_security_group.mccloud.id,
    ]
    subnets             = [for subnet in aws_subnet.mccloud : subnet.id]
    type                = "SPOT"
    allocation_strategy = "BEST_FIT"
    bid_percentage      = 100
    spot_iam_fleet_role = aws_iam_role.mccloud_batch_spot_fleet_service_role.arn
    tags = merge(local.common_tags, {
      Name = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}-batch-ec2-spot"
    })

    launch_template {
      launch_template_name = aws_launch_template.mccloud_batch_main.name
    }
  }

  service_role = aws_iam_role.mccloud_batch_service_role.arn
  type         = "MANAGED"
  depends_on = [
    aws_iam_role_policy_attachment.mccloud_batch_service_role
  ]

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      compute_resources[0].desired_vcpus,
    ]
  }
}

resource "aws_batch_job_queue" "mccloud_main" {
  name     = "mccloud-${var.DEPLOYMENT_ENVIRONMENT}"
  state    = "ENABLED"
  priority = 10
  compute_environments = [
    aws_batch_compute_environment.mccloud_ec2_spot.arn,
  ]
}
