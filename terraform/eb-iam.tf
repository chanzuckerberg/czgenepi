data "aws_secretsmanager_secret" "aspen_config" {
  name = "aspen-config"
}

resource "aws_iam_policy" "aspen-elasticbeanstalk-ec2-policies" {
  name = "aspen-elasticbeanstalk-ec2-policies"
  policy = templatefile("${path.module}/iam_templates/eb-policy.json", {
    ASPEN_CONFIG_SECRET_ARN = data.aws_secretsmanager_secret.aspen_config.arn,
    ASPEN_DB_ARN = aws_db_instance.db.arn,
  })
}

resource "aws_iam_role" "aspen-elasticbeanstalk-ec2-role" {
  name = "aspen-elasticbeanstalk-ec2-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ec2"]
  })
}

resource "aws_iam_role_policy_attachment" "aspen_elasticbeanstalk_ec2_AWSElasticBeanstalkWebTier" {
  role       = aws_iam_role.aspen-elasticbeanstalk-ec2-role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "aspen_elasticbeanstalk_ec2_AWSElasticBeanstalkMulticontainerDocker" {
  role       = aws_iam_role.aspen-elasticbeanstalk-ec2-role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

resource "aws_iam_role_policy_attachment" "aspen_elasticbeanstalk_ec2_AWSElasticBeanstalkWorkerTier" {
  role       = aws_iam_role.aspen-elasticbeanstalk-ec2-role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "aspen_elasticbeanstalk_ec2_custom_policies" {
  role       = aws_iam_role.aspen-elasticbeanstalk-ec2-role.name
  policy_arn = aws_iam_policy.aspen-elasticbeanstalk-ec2-policies.arn
}

resource "aws_iam_instance_profile" "aspen-elasticbeanstalk-ec2-instance-profile" {
  name = "aspen-elasticbeanstalk-ec2-instance-profile"
  role = aws_iam_role.aspen-elasticbeanstalk-ec2-role.name
}
