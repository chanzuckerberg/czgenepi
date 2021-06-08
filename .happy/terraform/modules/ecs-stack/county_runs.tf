# SCC runs are enabled for both prod and staging.  All other runs are only enabled for prod.

module nextstrain_scc_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-scc-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = contains(["prod", "staging"], local.deployment_stage) ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
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
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = contains(["prod", "staging"], local.deployment_stage) ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
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

module nextstrain_alameda_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-alameda-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Alameda County Public Health Department"
    s3_filestem              = "Alameda Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Alameda County"
    }
  }
}

module nextstrain_alameda_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-alameda-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Alameda County Public Health Department"
    s3_filestem              = "Alameda Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Alameda County"
    }
  }
}

module nextstrain_contra_costa_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-contra-costa-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Contra Costa County Public Health Laboratories"
    s3_filestem              = "Contra Costa Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Contra Costa County"
    }
  }
}

module nextstrain_contra_costa_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-contra-costa-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Contra Costa County Public Health Laboratories"
    s3_filestem              = "Contra Costa Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Contra Costa County"
    }
  }
}

module nextstrain_fresno_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-fresno-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Fresno County Public Health"
    s3_filestem              = "Fresno Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Fresno County"
    }
  }
}

module nextstrain_fresno_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-fresno-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Fresno County Public Health"
    s3_filestem              = "Fresno Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Fresno County"
    }
  }
}

module nextstrain_humboldt_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-humboldt-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Humboldt County Dept Human and Health Sevices-Public Health"
    s3_filestem              = "Humboldt Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Humboldt County"
    }
  }
}

module nextstrain_humboldt_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-humboldt-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Humboldt County Dept Human and Health Sevices-Public Health"
    s3_filestem              = "Humboldt Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Humboldt County"
    }
  }
}

module nextstrain_marin_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-marin-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Marin County Department of Health & Human Services"
    s3_filestem              = "Marin Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Marin County"
    }
  }
}

module nextstrain_marin_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-marin-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Marin County Department of Health & Human Services"
    s3_filestem              = "Marin Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Marin County"
    }
  }
}

module nextstrain_monterey_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-monterey-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Monterey County Health Department"
    s3_filestem              = "Monterey Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Monterey County CA"
    }
  }
}

module nextstrain_monterey_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-monterey-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Monterey County Health Department"
    s3_filestem              = "Monterey Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Monterey County CA"
    }
  }
}

module nextstrain_orange_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-orange-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Orange County Health Care Agency"
    s3_filestem              = "Orange Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Orange County CA"
    }
  }
}

module nextstrain_orange_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-orange-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Orange County Health Care Agency"
    s3_filestem              = "Orange Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Orange County CA"
    }
  }
}

module nextstrain_san_bernardino_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-bernardino-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Bernardino County Public Health"
    s3_filestem              = "San Bernardino Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "San Bernardino County"
    }
  }
}

module nextstrain_san_bernardino_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-bernardino-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Bernardino County Public Health"
    s3_filestem              = "San Bernardino Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "San Bernardino County"
    }
  }
}

module nextstrain_san_joaquin_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-joaquin-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Joaquin County Public Health Services"
    s3_filestem              = "San Joaquin Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "San Joaquin County"
    }
  }
}

module nextstrain_san_joaquin_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-joaquin-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Joaquin County Public Health Services"
    s3_filestem              = "San Joaquin Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "San Joaquin County"
    }
  }
}

module nextstrain_san_luis_obispo_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-luis-obispo-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Luis Obispo County Health Agency, Public Health Laboratories"
    s3_filestem              = "San Luis Obispo Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "San Luis Obispo County"
    }
  }
}

module nextstrain_san_luis_obispo_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-luis-obispo-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Luis Obispo County Health Agency, Public Health Laboratories"
    s3_filestem              = "San Luis Obispo Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "San Luis Obispo County"
    }
  }
}

module nextstrain_san_francisco_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-francisco-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Francisco Public Health Laboratory"
    s3_filestem              = "San Francisco Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "San Francisco County"
    }
  }
}

module nextstrain_san_francisco_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-francisco-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Francisco Public Health Laboratory"
    s3_filestem              = "San Francisco Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "San Francisco County"
    }
  }
}

module nextstrain_tulare_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-tulare-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Tulare County Public Health Lab"
    s3_filestem              = "Tulare Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Southern San Joaquin Valley"
    }
  }
}

module nextstrain_tulare_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-tulare-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Tulare County Public Health Lab"
    s3_filestem              = "Tulare Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Southern San Joaquin Valley"
    }
  }
}

module nextstrain_tuolumne_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-tuolumne-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Tuolumne County Public Health"
    s3_filestem              = "Tuolumne Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Tuolumne County"
    }
  }
}

module nextstrain_tuolumne_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-tuolumne-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Tuolumne County Public Health"
    s3_filestem              = "Tuolumne Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Tuolumne County"
    }
  }
}

module nextstrain_ventura_local_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-ventura-local-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Ventura County Public Health Laboratory"
    s3_filestem              = "Ventura Local"
    template_filename        = "group.yaml"
    template_args            = {
     division = "California"
     location = "Ventura County"
    }
  }
}

module nextstrain_ventura_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-ventura-contextual-sfn"
  image    = "${local.nextstrain_image_repo}:${local.image_tag}"
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn_spot.step_function_arn
  schedule_expressions  = local.deployment_stage == "prod" ? ["cron(0 17 ? * 1-5 *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    aspen_config_secret_name = "${local.deployment_stage}/aspen-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Ventura County Public Health Laboratory"
    s3_filestem              = "Ventura Contextual"
    template_filename        = "group_plus_context.yaml"
    template_args            = {
      division = "California"
      location = "Ventura County"
    }
  }
}
