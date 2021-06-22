rule calc_recency_priorities:
  input:
    metadata="results/sanitized_metadata_aspen.tsv.xz" # output from sanitized_metadata
  output:
    priorities_file = "results/priorities.tsv"
  conda: config["conda_environment"]
  shell:
    """
    python3 ./calc_recency_priorities.py \
    --metadata {input.metadata} \
    --output {output.priorities_file}
    """
