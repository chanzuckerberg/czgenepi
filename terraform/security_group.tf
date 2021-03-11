resource "aws_security_group" "db-security-group" {
  name        = "db"
  description = "security group for database"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "remote-db-access" {
  count             = var.DEPLOYMENT_ENVIRONMENT == "prod" ? 0 : 1
  security_group_id = aws_security_group.db-security-group.id
  type              = "ingress"
  description       = "ttung"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  cidr_blocks       = ["24.4.203.80/32"]
}
