terraform {
  required_providers {
     postgresql = {
      source = "cyrilgdn/postgresql"
      version = "1.11.2"
    }
  }
}

variable "db_credentials" {
  type = object({
    admin_username = string
    admin_password = string
    rw_username = string
    rw_password = string
    ro_username = string
    ro_password = string
  })
}

variable "connect_db_password" {
  type = string
  sensitive = true
}

resource "aws_db_instance" "db" {
    identifier             = "aspen-db"
    allocated_storage      = 10
    storage_type           = "gp2"
    engine                 = "postgres"
    engine_version         = "13.1"
    port                   = 5432
    instance_class         = "db.m6g.large"
    name                   = "aspen_db"
    username               = var.db_credentials.admin_username
    password               = var.db_credentials.admin_password
    publicly_accessible    = var.DEPLOYMENT_ENVIRONMENT != "prod"
    vpc_security_group_ids = [aws_security_group.db-security-group.id]
}

# Setup PostgreSQL Provider After RDS Database is Provisioned
provider "postgresql" {
    scheme          = "awspostgres"
    host            = aws_db_instance.db.address
    port            = aws_db_instance.db.port
    username        = var.db_credentials.admin_username
    password        = var.connect_db_password == "NOT_SET" ? var.db_credentials.admin_password : var.connect_db_password
    superuser       = false
}

# Create App User
resource "postgresql_role" "user_rw" {
    name                = var.db_credentials.rw_username
    login               = true
    password            = var.db_credentials.rw_password
    encrypted_password  = true
    depends_on          = [aws_db_instance.db]
}

# Create R/O User
resource "postgresql_role" "user_ro" {
    name                = var.db_credentials.ro_username
    login               = true
    password            = var.db_credentials.ro_password
    encrypted_password  = true
    depends_on          = [aws_db_instance.db]
}

resource "postgresql_grant" "grant_create" {
  database    = aws_db_instance.db.name
  role        = postgresql_role.user_rw.name
  object_type = "database"
  privileges  = ["CREATE"]
}
