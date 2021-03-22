resource "aws_iam_role" "aspen-batch-jobs-role" {
  name = "aspen-batch-jobs-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ecs-tasks"]
  })
}


resource "aws_iam_role" "aspen-batch-ecs-instance-role" {
  name = "aspen-batch-ecs-instance-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ec2"]
  })
}


resource "aws_iam_role_policy_attachment" "aspen-batch-ecs-instance-role" {
  role       = aws_iam_role.aspen-batch-ecs-instance-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}


resource "aws_iam_instance_profile" "aspen-batch-ecs-instance-role" {
  name = "aspen-ecs-instance-profile"
  role = aws_iam_role.aspen-batch-ecs-instance-role.name
}


resource "aws_iam_role" "aspen-batch-service-role" {
  name = "aspen-batch-service-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["batch"]
  })
}


resource "aws_iam_role_policy_attachment" "aspen-batch-service-role" {
  role       = aws_iam_role.aspen-batch-service-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}
