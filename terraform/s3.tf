resource "aws_s3_bucket" "aspen-data" {
  bucket = join("", ["aspen-data-", var.DEPLOYMENT_ENVIRONMENT])
  acl = "private"
}
