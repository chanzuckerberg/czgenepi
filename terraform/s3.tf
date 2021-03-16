resource "aws_s3_bucket" "nextstrain_jobs" {
  bucket = "aspen-nextstrain-jobs"
  acl = "private"

  # this is what nextstrain docs reccomend
  lifecycle_rule {
    enabled = true

    transition {
      days = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 90
    }
  }
}
