locals {
  nextstrain_sfn_memory = 64000
  nextstrain_sfn_vcpus = 10
  nextstrain_cron_schedule = local.deployment_stage == "geprod" ? ["cron(0 5 ? * MON-SAT *)"] : []
}

module nextstrain_chicago_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-chicago-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Chicago Department of Public Health"
    s3_filestem              = "Chicago"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_scc_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-scc-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Santa Clara County Public Health"
    s3_filestem              = "Santa Clara"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_alameda_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-alameda-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Alameda County Public Health Department"
    s3_filestem              = "Alameda"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_contra_costa_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-contra-costa-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Contra Costa County Public Health Laboratories"
    s3_filestem              = "Contra Costa"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_fresno_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-fresno-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Fresno County Public Health"
    s3_filestem              = "Fresno"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_humboldt_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-humboldt-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Humboldt County Dept Human and Health Sevices-Public Health"
    s3_filestem              = "Humboldt"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_marin_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-marin-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Marin County Department of Health & Human Services"
    s3_filestem              = "Marin"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_monterey_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-monterey-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Monterey County Health Department"
    s3_filestem              = "Monterey"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_orange_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-orange-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Orange County Public Health Laboratory"
    s3_filestem              = "Orange"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_san_bernardino_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-bernardino-contextual"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Bernardino County Public Health"
    s3_filestem              = "San Bernardino"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_del_norte_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-del-norte-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Del Norte Public Health Laboratory"
    s3_filestem              = "Del Norte"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_san_joaquin_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-joaquin-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Joaquin County Public Health Services"
    s3_filestem              = "San Joaquin"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_san_luis_obispo_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-luis-obispo-contextual"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Luis Obispo County Health Agency, Public Health Laboratories"
    s3_filestem              = "San Luis Obispo"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_san_francisco_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-san-francisco-contextual"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "San Francisco Public Health Laboratory"
    s3_filestem              = "San Francisco"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}


module nextstrain_tulare_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-tulare-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Tulare County Public Health Lab"
    s3_filestem              = "Tulare"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_tuolumne_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-tuolumne-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Tuolumne County Public Health"
    s3_filestem              = "Tuolumne"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}

module nextstrain_ventura_contextual_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-ventura-contextual-sfn"
  image    = local.nextstrain_image
  vcpus    = local.nextstrain_sfn_vcpus
  memory   = local.nextstrain_sfn_memory
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = module.swipe_sfn.step_function_arn
  schedule_expressions  = local.nextstrain_cron_schedule
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = "${local.deployment_stage}/genepi-config"
    remote_dev_prefix        = local.remote_dev_prefix
    group_name               = "Ventura County Public Health Laboratory"
    s3_filestem              = "Ventura"
    template_args            = {}
    tree_type                = "OVERVIEW"
  }
}
