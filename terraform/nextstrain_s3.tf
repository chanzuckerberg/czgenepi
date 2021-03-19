resource "aws_s3_bucket" "nextstrain_jobs" {
  bucket = "aspen-nextstrain-jobs"
  acl = "private"

  # this is what nextstrain docs recommend
  lifecycle_rule {
    enabled = true

    transition {
      days = 30
      storage_class = "ONEZONE_IA"
    }

    expiration {
      days = 90
    }
  }
}
