# This deploys an Aspen stack.
#

data aws_secretsmanager_secret_version config {
  secret_id = var.happy_config_secret
}

data aws_secretsmanager_secret_version app_secret {
  secret_id = local.app_secret_name
}

locals {
  secret = jsondecode(data.aws_secretsmanager_secret_version.config.secret_string)
  app_secret = jsondecode(data.aws_secretsmanager_secret_version.app_secret.secret_string)
  alb_key = var.require_okta ? "private_albs" : "public_albs"

  app_secret_name = "${local.deployment_stage}/genepi-config"

  custom_stack_name     = var.stack_name
  priority              = var.priority
  deployment_stage      = var.deployment_stage
  remote_dev_prefix     = var.stack_prefix
  wait_for_steady_state = var.wait_for_steady_state

  migration_cmd         = ["make", "remote-db-migrations"]
  deletion_cmd          = ["make", "remote-db-drop"]
  backend_cmd           = []
  frontend_cmd          = ["npm", "run", "serve"]
  data_load_path        = length(var.sql_import_file) > 0 ? "${local.secret["s3_buckets"]["genepi"]["name"]}/${var.sql_import_file}" : ""

  vpc_id                = local.secret["vpc_id"]
  subnets               = local.secret["private_subnets"]
  security_groups       = local.secret["security_groups"]
  zone                  = local.secret["zone_id"]
  cluster               = local.secret["cluster_arn"]
  ecs_execution_role    = lookup(local.secret, "ecs_execution_role", "")

  swipe_comms_bucket    = local.secret["s3_buckets"]["genepi_swipe_comms"]["name"]
  swipe_wdl_bucket      = local.secret["s3_buckets"]["genepi_swipe_wdl"]["name"]

  # Web images
  frontend_image   = join(":", [local.secret["ecrs"]["frontend"]["url"], lookup(var.image_tags, "frontend", var.image_tag)])
  backend_image    = join(":", [local.secret["ecrs"]["backend"]["url"], lookup(var.image_tags, "backend", var.image_tag)])

  # Workflow images
  pangolin_image   = join(":", [local.secret["ecrs"]["pangolin"]["url"], lookup(var.image_tags, "pangolin", var.image_tag)])
  nextstrain_image = join(":", [local.secret["ecrs"]["nextstrain"]["url"], lookup(var.image_tags, "nextstrain", var.image_tag)])
  gisaid_image     = join(":", [local.secret["ecrs"]["gisaid"]["url"], lookup(var.image_tags, "gisaid", var.image_tag)])

  # This is the wdl executor image, doesn't change on update.
  swipe_image     = join(":", [local.secret["ecrs"]["swipe"]["url"], "rev-7"]) # TODO - we probably don't want to hardcode this

  batch_role_arn = local.secret["batch_queues"]["genepi"]["role_arn"]
  ec2_queue_arn  = local.secret["batch_envs"]["genepi"]["envs"]["EC2"]["queue_arn"]
  spot_queue_arn = local.secret["batch_envs"]["genepi"]["envs"]["SPOT"]["queue_arn"]
  swipe_sfn_arn  = local.secret["swipe_sfn_arns"]["genepi"]["default"]
  external_dns   = local.secret["external_zone_name"]
  internal_dns   = local.secret["internal_zone_name"]

  frontend_listener_arn = local.secret[local.alb_key]["frontend"]["listener_arn"]
  backend_listener_arn  = local.secret[local.alb_key]["backend"]["listener_arn"]
  frontend_alb_zone     = local.secret[local.alb_key]["frontend"]["zone_id"]
  backend_alb_zone      = local.secret[local.alb_key]["backend"]["zone_id"]
  frontend_alb_dns      = local.secret[local.alb_key]["frontend"]["dns_name"]
  backend_alb_dns       = local.secret[local.alb_key]["backend"]["dns_name"]

  ecs_role_arn          = local.secret["service_roles"]["ecs_role"]
  event_role_arn        = local.secret["service_roles"]["event_role"]
  sfn_role_arn          = local.secret["service_roles"]["sfn_nextstrain"]

  frontend_url = try(join("", ["https://", module.frontend_dns[0].dns_prefix, ".", local.external_dns]), var.frontend_url)
  backend_url  = try(join("", ["https://", module.backend_dns[0].dns_prefix, ".", local.external_dns]), var.backend_url)

  stack_resource_prefix = "genepi"

  state_change_sns_topic_arn = local.secret["sns_topics"]["state_change"]
}

module frontend_dns {
  count                 = var.require_okta ? 1 : 0
  stack_resource_prefix = local.stack_resource_prefix
  source                = "../dns"
  custom_stack_name     = local.custom_stack_name
  app_name              = "frontend"
  alb_dns               = local.frontend_alb_dns
  canonical_hosted_zone = local.frontend_alb_zone
  zone                  = local.internal_dns
}

module backend_dns {
  count                 = var.require_okta ? 1 : 0
  stack_resource_prefix = local.stack_resource_prefix
  source                = "../dns"
  custom_stack_name     = local.custom_stack_name
  app_name              = "backend"
  alb_dns               = local.backend_alb_dns
  canonical_hosted_zone = local.backend_alb_zone
  zone                  = local.internal_dns
}

module frontend_service {
  source                = "../service"
  stack_resource_prefix = local.stack_resource_prefix
  execution_role        = local.ecs_execution_role
  memory                = 8192
  cpu                   = 4096
  custom_stack_name     = local.custom_stack_name
  app_name              = "frontend"
  vpc                   = local.vpc_id
  image                 = local.frontend_image
  cluster               = local.cluster
  desired_count         = 2
  listener              = local.frontend_listener_arn
  subnets               = local.subnets
  security_groups       = local.security_groups
  task_role_arn         = local.ecs_role_arn
  service_port          = 3000
  cmd                   = local.frontend_cmd
  deployment_stage      = local.deployment_stage
  host_match            = try(join(".", [module.frontend_dns[0].dns_prefix, local.external_dns]), "")
  priority              = local.priority
  api_url               = local.backend_url
  frontend_url          = local.frontend_url
  remote_dev_prefix     = local.remote_dev_prefix
  extra_env_vars        = {
    "SPLIT_FRONTEND_KEY": local.app_secret["SPLIT_FRONTEND_KEY"],
    "SEGMENT_FRONTEND_KEY": local.app_secret["SEGMENT_FRONTEND_KEY"],
    "ONETRUST_FRONTEND_KEY": local.app_secret["ONETRUST_FRONTEND_KEY"]
    }

  wait_for_steady_state = local.wait_for_steady_state
}

module backend_service {
  source                = "../service"
  stack_resource_prefix = local.stack_resource_prefix
  execution_role        = local.ecs_execution_role
  custom_stack_name     = local.custom_stack_name
  app_name              = "backend"
  vpc                   = local.vpc_id
  image                 = local.backend_image
  cluster               = local.cluster
  desired_count         = 2
  listener              = local.backend_listener_arn
  subnets               = local.subnets
  security_groups       = local.security_groups
  task_role_arn         = local.ecs_role_arn
  service_port          = 3000
  cmd                   = local.backend_cmd
  deployment_stage      = local.deployment_stage
  host_match            = try(join(".", [module.backend_dns[0].dns_prefix, local.external_dns]), "")
  priority              = local.priority
  api_url               = local.backend_url
  frontend_url          = local.frontend_url
  remote_dev_prefix     = local.remote_dev_prefix
  health_check_path     = "/v2/health/"  # the trailing slash here is vital.

  wait_for_steady_state = local.wait_for_steady_state
}

module swipe_sfn {
  source                     = "../swipe-sfn"

  count = local.deployment_stage == "prod" ? 1 : 0

  app_name                   = "swipe-spot"
  stack_resource_prefix      = local.stack_resource_prefix
  remote_dev_prefix          = local.remote_dev_prefix
  job_definition_name        = module.swipe_batch.batch_job_definition
  ec2_queue_arn              = local.ec2_queue_arn
  spot_queue_arn             = local.spot_queue_arn
  state_change_sns_topic_arn = local.state_change_sns_topic_arn
  role_arn                   = local.sfn_role_arn
  custom_stack_name          = local.custom_stack_name
  deployment_stage           = local.deployment_stage
}

# Write information on how to invoke the gisaid sfn to SSM.
module gisaid_sfn_config {
  source   = "../sfn_config"
  app_name = "gisaid-sfn"
  image    = local.gisaid_image
  vcpus    = 32
  memory   = 420000
  wdl_path = "workflows/gisaid.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = local.swipe_sfn_arn
  schedule_expressions  = contains(["geprod", "gestaging"], local.deployment_stage) ? ["cron(0 1 ? * MON-FRI *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = local.app_secret_name
    remote_dev_prefix = local.remote_dev_prefix
    # We'll use the wdl default values for ndjson_cache_key and gisaid_ndjson_url
  }
}

module pangolin_sfn_config {
  source   = "../sfn_config"
  app_name = "pangolin-sfn"
  image    = local.pangolin_image
  memory   = 120000
  wdl_path = "workflows/pangolin.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = local.swipe_sfn_arn
  schedule_expressions  = contains(["geprod", "gestaging"], local.deployment_stage) ? ["cron(0 23 ? * MON-FRI *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = local.app_secret_name
    remote_dev_prefix        = local.remote_dev_prefix
  }
}

module pangolin_ondemand_sfn_config {
  source   = "../sfn_config"
  app_name = "pangolin-ondemand-sfn"
  image    = local.pangolin_image
  memory   = 120000
  wdl_path = "workflows/pangolin-ondemand.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = local.swipe_sfn_arn
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = local.app_secret_name
    remote_dev_prefix        = local.remote_dev_prefix
  }
}

# This template is used as the starting point for all our scheduled
# nextstrain runs (the ones generated by nextstrain-autorun), so be
# aware that modifying variables here affects how all scheduled runs
# function.
module nextstrain_template_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-sfn"
  image    = local.nextstrain_image
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = local.swipe_sfn_arn
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    genepi_config_secret_name = local.app_secret_name
    remote_dev_prefix        = local.remote_dev_prefix
  }
}

module nextstrain_autorun_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-autorun-sfn"
  image    = local.backend_image
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain-autorun.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = local.swipe_sfn_arn
  schedule_expressions  = local.deployment_stage == "geprod" ? ["cron(0 3 ? * MON-FRI *)"] : []
  event_role_arn        = local.event_role_arn
  extra_args            =  {
    genepi_config_secret_name = local.app_secret_name
    remote_dev_prefix = local.remote_dev_prefix
    deployment_stage = local.deployment_stage
  }
}

module nextstrain_ondemand_template_sfn_config {
  source   = "../sfn_config"
  app_name = "nextstrain-ondemand-sfn"
  image    = local.nextstrain_image
  vcpus    = 10
  memory   = 64000
  wdl_path = "workflows/nextstrain-ondemand.wdl"
  custom_stack_name     = local.custom_stack_name
  deployment_stage      = local.deployment_stage
  remote_dev_prefix     = local.remote_dev_prefix
  stack_resource_prefix = local.stack_resource_prefix
  swipe_comms_bucket    = local.swipe_comms_bucket
  swipe_wdl_bucket      = local.swipe_wdl_bucket
  sfn_arn               = local.swipe_sfn_arn
  event_role_arn        = local.event_role_arn
   extra_args            =  {
    genepi_config_secret_name = local.app_secret_name
    remote_dev_prefix        = local.remote_dev_prefix
  }
}

module migrate_db {
  source                = "../migration"
  stack_resource_prefix = local.stack_resource_prefix
  image                 = local.backend_image
  task_role_arn         = local.ecs_role_arn
  execution_role        = local.ecs_execution_role
  cmd                   = local.migration_cmd
  custom_stack_name     = local.custom_stack_name
  remote_dev_prefix     = local.remote_dev_prefix
  deployment_stage      = local.deployment_stage
  data_load_path        = local.data_load_path
}

module delete_db {
  count                 = var.delete_protected ? 0 : 1
  stack_resource_prefix = local.stack_resource_prefix
  source                = "../deletion"
  image                 = local.backend_image
  task_role_arn         = local.ecs_role_arn
  execution_role        = local.ecs_execution_role
  cmd                   = local.deletion_cmd
  custom_stack_name     = local.custom_stack_name
  remote_dev_prefix     = local.remote_dev_prefix
  deployment_stage      = local.deployment_stage
}

module swipe_batch {
  source                = "../batch"
  app_name              = "swipe"
  stack_resource_prefix = local.stack_resource_prefix
  batch_role_arn        = local.batch_role_arn
  swipe_image           = local.swipe_image
  custom_stack_name     = local.custom_stack_name
  remote_dev_prefix     = local.remote_dev_prefix
  deployment_stage      = local.deployment_stage
  frontend_url          = local.frontend_url
}
