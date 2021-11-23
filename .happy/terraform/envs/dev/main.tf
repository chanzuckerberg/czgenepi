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
  deployment_stage    = "dev"
  delete_protected    = false
  require_okta        = true
  stack_prefix        = "/${var.stack_name}"
  sql_import_file     = "db_snapshots/dev_backup.sql"
  use_fargate         = true

  wait_for_steady_state = var.wait_for_steady_state
}
