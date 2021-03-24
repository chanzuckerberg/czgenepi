data "aws_secretsmanager_secret" "gisaid-download-credentials" {
  name = "gisaid-download-credentials"
}

resource "aws_iam_role" "aspen-batch-jobs-role" {
  name = "aspen-batch-jobs-role"
  assume_role_policy = templatefile("${path.module}/iam_templates/trust_policy.json", {
    trust_services = ["ecs-tasks"]
  })
}


resource "aws_iam_policy" "aspen-batch-jobs-policies" {
  name = "aspen-batch-jobs-policies"
  policy = <<-POLICY
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": "secretsmanager:GetSecretValue",
              "Resource": [
                  "${data.aws_secretsmanager_secret.aspen_config.arn}",
                  "${data.aws_secretsmanager_secret.gisaid-download-credentials.arn}"
              ]
          },
          {
              "Effect": "Allow",
              "Action": [
                  "batch:SubmitJob"
              ],
              "Resource": [
                  "arn:aws:batch:*:*:job-definition/${aws_batch_job_definition.aspen-batch-job-definition.name}:*",
                  "arn:aws:batch:*:*:job-queue/${aws_batch_job_queue.aspen-batch-job-queue.name}"
              ]
          },
          {
              "Effect": "Allow",
              "Action": "rds:DescribeDBInstances",
              "Resource": [
                  "${aws_db_instance.db.arn}"
              ]
          },
          {
              "Effect": "Allow",
              "Action": [
                  "s3:GetObject",
                  "s3:PutObject"
              ],
              "Resource": [
                  "arn:aws:s3:::${aws_s3_bucket.aspen-data.bucket}/raw_gisaid_dump/*",
                  "arn:aws:s3:::${aws_s3_bucket.aspen-data.bucket}/processed_gisaid_dump/*"
              ]
          }
      ]
  }
  POLICY
}


resource "aws_iam_role_policy_attachment" "aspen-batch-job-policies" {
  role       = aws_iam_role.aspen-batch-jobs-role.name
  policy_arn = aws_iam_policy.aspen-batch-jobs-policies.arn
}
