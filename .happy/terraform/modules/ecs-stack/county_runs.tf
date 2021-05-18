# SCC runs are enabled for both prod and staging.  All other runs are only enabled for prod.

module nextstrain_scc_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-scc-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  memory   = 32000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = contains(["prod", "staging"], local.deployment_stage) ? ["cron(0 0 ? * 1-5 *)"] : []
  event_role_arn        = local.ecs_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Santa Clara County Public Health"
    s3_filestem              = "Santa Clara Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Santa Clara County"
    }
  }
}

module nextstrain_scc_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-scc-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  memory   = 32000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = contains(["prod", "staging"], local.deployment_stage) ? ["cron(0 0 ? * 1-5 *)"] : []
  event_role_arn        = local.ecs_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Santa Clara County Public Health"
    s3_filestem              = "Santa Clara Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Santa Clara County"
    }
  }
}

