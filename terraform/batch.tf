resource "aws_iam_role" "batch-ecs-instance-role" {
  name = "batch-ecs-instance-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ec2"]
  })
}


resource "aws_iam_role_policy_attachment" "batch-ecs-instance-role" {
  role       = aws_iam_role.batch-ecs-instance-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}


resource "aws_iam_instance_profile" "batch-ecs-instance-role" {
  name = "batch-ecs-instance-profile"
  role = aws_iam_role.batch-ecs-instance-role.name
}


resource "aws_iam_role" "batch-service-role" {
  name = "batch-service-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["batch"]
  })
}


resource "aws_iam_role_policy_attachment" "batch-service-role" {
  role       = aws_iam_role.batch-service-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}
