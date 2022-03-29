output "batch_job_definition" {
  value       = aws_batch_job_definition.batch_job_def.name
  description = "Name of the batch job definition"
}
