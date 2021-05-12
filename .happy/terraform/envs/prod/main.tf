module stack {
  source              = "./modules/ecs-stack"
  aws_account_id      = var.aws_account_id
  aws_role            = var.aws_role
  happymeta_          = var.happymeta_
  happy_config_secret = var.happy_config_secret
  image_tag           = var.image_tag
  priority            = var.priority
  stack_name          = var.stack_name
  deployment_stage    = "prod"
  delete_protected    = false
  require_okta        = false
  sql_import_file     = "db_snapshots/dev_backup.sql"
  frontend_url        = "https://aspen.cziscience.com"
  backend_url         = "https://api.aspen.cziscience.com"
  stack_prefix        = ""

  wait_for_steady_state = var.wait_for_steady_state
}
