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

resource "aws_iam_role" "nextstrain-jobs-rule" {
  name = "nextstrain-jobs-rule"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ecs"]
  })
}

resource "aws_iam_role_policy_attachment" "attach-nextstrain-bucket-policy" {
  role = aws_iam_role.nextstrain-jobs-rule.name
  policy_arn = aws_iam_policy.nextstrain-jobs-access-to-bucket.arn
}

resource "aws_iam_group" "nextstrain-users" {
  name = "nextstrain-users"
}

resource "aws_iam_group_policy_attatchment" "attach-nextstrain-policies-to-group" {
  for_each = toset(
    [
      aws_iam_policy.nextstrain-jobs-access-to-batch,
      aws_iam_policy.nextstrain-jobs-access-to-bucket,
      aws_iam_policy.nextstrain-jobs-access-to-logs,
    ]
  )
  group = aws_iam_group.nextstrain-users.name
  policy_arn = each.arn
}
