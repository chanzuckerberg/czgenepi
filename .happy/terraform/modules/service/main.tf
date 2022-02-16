# This is a service managed by ECS attached to the environment's load balancer
#
locals {
  default_env_vars = {
    "REMOTE_DEV_PREFIX" : "${var.remote_dev_prefix}",
    "GENEPI_CONFIG_SECRET_NAME" : "${var.deployment_stage}/genepi-config",
    "DEPLOYMENT_STAGE" : "${var.deployment_stage}",
    "AWS_REGION" : "${data.aws_region.current.name}",
    "FRONTEND_URL" : "${var.frontend_url}",
    "API_URL" : "${var.api_url}",
    "FLASK_ENV" : "production",
    "AWS_DEFAULT_REGION" : "${data.aws_region.current.name}",
  }
  env_vars = [for k, v in merge(local.default_env_vars, var.extra_env_vars) : { "name" : k, "value" : v }]
}


data "aws_region" "current" {}

resource "aws_ecs_service" "service" {
  cluster         = var.cluster
  desired_count   = var.desired_count
  task_definition = aws_ecs_task_definition.task_definition.id
  launch_type     = "FARGATE"
  name            = "${var.custom_stack_name}-${var.app_name}"
  load_balancer {
    container_name   = "web"
    container_port   = var.service_port
    target_group_arn = aws_lb_target_group.target_group.id
  }
  network_configuration {
    security_groups  = var.security_groups
    subnets          = var.subnets
    assign_public_ip = false
  }

  enable_execute_command = true
  wait_for_steady_state  = var.wait_for_steady_state
}

resource "aws_ecs_task_definition" "task_definition" {
  family                   = "${var.stack_resource_prefix}-${var.deployment_stage}-${var.custom_stack_name}-${var.app_name}"
  memory                   = var.memory
  cpu                      = var.cpu
  network_mode             = "awsvpc"
  task_role_arn            = var.task_role_arn
  execution_role_arn       = var.execution_role
  requires_compatibilities = ["FARGATE"]
  container_definitions = jsonencode([
    {
      "name" : "web",
      "essential" : true,
      "image" : var.image,
      "environment" : local.env_vars,
      "portMappings" : [
        {
          "containerPort" : var.service_port
        }
      ],
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-stream-prefix" : "fargate",
          "awslogs-group" : "${aws_cloudwatch_log_group.cloud_watch_logs_group.id}",
          "awslogs-region" : "${data.aws_region.current.name}"
        }
      },
      "command" : (length(var.cmd) == 0) ? null : var.cmd,
    }
  ])
}

resource "aws_cloudwatch_log_group" "cloud_watch_logs_group" {
  retention_in_days = 365
  name              = "/${var.stack_resource_prefix}/${var.deployment_stage}/${var.custom_stack_name}/${var.app_name}"
}

resource "aws_lb_target_group" "target_group" {
  vpc_id               = var.vpc
  port                 = var.service_port
  protocol             = "HTTP"
  target_type          = "ip"
  deregistration_delay = 10
  health_check {
    interval            = 15
    path                = var.health_check_path
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 10
    matcher             = "200-299"
  }
}

resource "aws_lb_listener_rule" "listener_rule" {
  listener_arn = var.listener
  priority     = var.priority
  # Dev stacks need to match on hostnames
  dynamic "condition" {
    for_each = length(var.host_match) == 0 ? [] : [var.host_match]
    content {
      host_header {
        values = [
          condition.value
        ]
      }
    }
  }
  # Staging/prod envs are only expected to have a single stack,
  # so let's add all requests to that stack.
  dynamic "condition" {
    for_each = length(var.host_match) == 0 ? ["/*"] : []
    content {
      path_pattern {
        values = [condition.value]
      }
    }
  }
  action {
    target_group_arn = aws_lb_target_group.target_group.id
    type             = "forward"
  }
}
