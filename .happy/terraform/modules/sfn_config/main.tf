locals {
  input_data = jsonencode({
    Input = {
      Run = merge(var.extra_args, {
         docker_image_id = var.image
         aws_region = "us-west-2" # FIXME hardcoded.
      }
      )
    }
    OutputPrefix = "s3://${var.swipe_comms_bucket}/swipe${var.remote_dev_prefix}/${var.app_name}/results",
    RunSPOTMemory = var.memory - 2000,
    RunEC2Memory = var.memory - 2000,
    RunSPOTVcpu = var.vcpus,
    RunEC2Vcpu = var.vcpus,
    RUN_WDL_URI = "s3://${aws_s3_bucket_object.wdl.bucket}${aws_s3_bucket_object.wdl.key}",
    StateMachineArn = var.sfn_arn,
  })
}

resource "aws_s3_bucket_object" "wdl" {
  bucket = var.swipe_wdl_bucket
  key    = "${var.remote_dev_prefix}/${basename(var.wdl_path)}-v0.0.1.wdl" # Swipe lambdas require specially formatted filenames.
  source = "${path.module}/${basename(var.wdl_path)}" # TODO this is a haaaack!
  etag = filemd5("${path.module}/${basename(var.wdl_path)}")
}

resource "aws_ssm_parameter" "run_config" {
  name  = "/${var.stack_resource_prefix}/${var.deployment_stage}/${var.custom_stack_name}/${var.app_name}"
  type  = "String"
  value = local.input_data
}
