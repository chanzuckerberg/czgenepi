module stack {
  source              = "./modules/ecs-stack"
  aws_account_id      = var.aws_account_id
  aws_role            = var.aws_role
  happymeta_          = var.happymeta_
  happy_config_secret = var.happy_config_secret
  image_tag           = var.image_tag
  image_tags          = jsondecode(var.image_tags)
  priority            = var.priority
  stack_name          = var.stack_name
  deployment_stage    = "gestaging"
  delete_protected    = false
  require_okta        = false
  sql_import_file     = "db_snapshots/dev_backup.sql"
  frontend_url        = "https://staging.czgenepi.org"
  backend_url         = "https://api.staging.czgenepi.org"
  stack_prefix        = ""

  wait_for_steady_state = var.wait_for_steady_state
}
