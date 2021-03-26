resource "aws_s3_bucket" "aspen-db-data" {
  bucket = join("", ["aspen-db-data-", var.DEPLOYMENT_ENVIRONMENT])
  acl = "private"
}
