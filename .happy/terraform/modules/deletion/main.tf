data aws_region current {}

resource aws_ecs_task_definition task_definition {
  family        = "${var.stack_resource_prefix}-${var.deployment_stage}-${var.custom_stack_name}-deletion"
  network_mode  = "awsvpc"
  cpu    = 2048
  memory = 4096
  task_role_arn = var.task_role_arn
  execution_role_arn = var.execution_role
  requires_compatibilities = [ "FARGATE" ]
  container_definitions = <<EOF
[
  {
    "name": "deletedb",
    "essential": true,
    "image": "${var.image}",
    "environment": [
      {
        "name": "AWS_REGION",
        "value": "${data.aws_region.current.name}"
      },
      {
        "name": "AWS_DEFAULT_REGION",
        "value": "${data.aws_region.current.name}"
      },
      {
        "name": "REMOTE_DEV_PREFIX",
        "value": "${var.remote_dev_prefix}"
      },
      {
        "name": "DEPLOYMENT_STAGE",
        "value": "${var.deployment_stage}"
      },
      {
        "name": "GENEPI_CONFIG_SECRET_NAME",
        "value": "${var.deployment_stage}/genepi-config"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-stream-prefix": "fargate",
        "awslogs-group": "${aws_cloudwatch_log_group.cloud_watch_logs_group.id}",
        "awslogs-region": "${data.aws_region.current.name}"
      }
    },
    "command": ${jsonencode(var.cmd)}
  }
]
EOF
}

resource aws_cloudwatch_log_group cloud_watch_logs_group {
  retention_in_days = 365
  name              = "/${var.stack_resource_prefix}/${var.deployment_stage}/${var.custom_stack_name}/deletion"
}
