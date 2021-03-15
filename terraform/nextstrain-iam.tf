resource "aws_iam_policy" "nextstrain-jobs-access-to-batch" {
  name = "nextstrain-jobs-access-to-batch"
  policy = templatefile("${path.module}/iam_templates/nextstrain-jobs-access-to-batch.json")
}

resource "aws_iam_policy" "nextstrain-jobs-access-to-bucket" {
  name = "nextstrain-jobs-access-to-bucket"
  policy = templatefile("${path.module}/iam_templates/nextstrain-jobs-access-to-bucket.json")
}

resource "aws_iam_policy" "nextstrain-jobs-access-to-logs" {
  name = "nextstrain-jobs-access-to-logs"
  policy = templatefile("${path.module}/iam_templates/nextstrain-jobs-access-to-logs.json")
}
