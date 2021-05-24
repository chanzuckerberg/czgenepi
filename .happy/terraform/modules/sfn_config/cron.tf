resource "aws_cloudwatch_event_rule" "cloudwatch-event-rule" {
  count               = length(var.schedule_expressions)
  name                = "${var.stack_resource_prefix}-${var.deployment_stage}-${var.custom_stack_name}-${var.app_name}"
  description         = "Scheduled task for ${var.app_name}"
  schedule_expression = var.schedule_expressions[count.index]
}


resource "aws_cloudwatch_event_target" "cloudwatch-event-target" {
  count     = length(var.schedule_expressions)
  target_id = "${var.stack_resource_prefix}-${var.deployment_stage}-${var.custom_stack_name}-${var.app_name}"
  rule      = aws_cloudwatch_event_rule.cloudwatch-event-rule[count.index].name
  arn       = var.sfn_arn
  input     = local.input_data
  role_arn  = var.event_role_arn
}

