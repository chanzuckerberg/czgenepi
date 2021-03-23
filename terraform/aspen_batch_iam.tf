resource "aws_iam_role" "aspen-batch-jobs-role" {
  name = "aspen-batch-jobs-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ecs-tasks"]
  })
}
