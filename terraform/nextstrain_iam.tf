resource "aws_iam_policy" "nextstrain-jobs-access-to-batch" {
  name = "nextstrain-jobs-access-to-batch"
  policy = templatefile("${path.module}/policies/nextstrain_jobs_access_to_batch.json", {
    NEXTSTRAIN_JOBS_ROLE = aws_iam_role.batch-ecs-instance-role.name
  })
}


resource "aws_iam_policy" "nextstrain-jobs-access-to-bucket" {
  name = "nextstrain-jobs-access-to-bucket"
  policy = file("${path.module}/policies/nextstrain_jobs_access_to_bucket.json")
}


resource "aws_iam_policy" "nextstrain-jobs-access-to-logs" {
  name = "nextstrain-jobs-access-to-logs"
  policy = file("${path.module}/policies/nextstrain_jobs_access_to_logs.json")
}


resource "aws_iam_role" "nextstrain-jobs-role" {
  name = "nextstrain-jobs-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ecs-tasks"]
  })
}


resource "aws_iam_role_policy_attachment" "attach-nextstrain-bucket-policy" {
  role = aws_iam_role.nextstrain-jobs-role.name
  policy_arn = aws_iam_policy.nextstrain-jobs-access-to-bucket.arn
}


# TODO: uncomment this when iam:CreateGroup permission is granted
# resource "aws_iam_group" "nextstrain-users" {
#   name = "nextstrain-users"
#   description = "group of users who need to run nextstrain/access resources"
# }


# resource "aws_iam_group_policy_attachment" "attach-batch-policy-to-nextstrain-group" {
#   group = aws_iam_group.nextstrain-users.name
#   policy_arn = aws_iam_policy.nextstrain-jobs-access-to-batch.arn
# }


# resource "aws_iam_group_policy_attachment" "attach-bucket-policy-to-nextstrain-group" {
#   group = aws_iam_group.nextstrain-users.name
#   policy_arn = aws_iam_policy.nextstrain-jobs-access-to-bucket.arn
# }


# resource "aws_iam_group_policy_attachment" "attach-logs-policy-to-nextstrain-group" {
#   group = aws_iam_group.nextstrain-users.name
#   policy_arn = aws_iam_policy.nextstrain-jobs-access-to-logs.arn
# }
