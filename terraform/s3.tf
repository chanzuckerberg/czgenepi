resource "aws_s3_bucket" "nextstrain_jobs" {
  bucket = "aspen-nextstrain-jobs"
  acl = private

  rule {
    expiration {
      days = 30
    }
  }
}
