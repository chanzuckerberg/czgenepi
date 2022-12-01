from aspen.database.models import SampleQCMetric
from aspen.database.models.lineages import QCMetricCaller


def sample_qc_metrics_factory(
    sample,
    qc_caller=QCMetricCaller.NEXTCLADE,
    qc_score="1",
    qc_software_version="1.0.0",
    qc_status="good",
    raw_qc_output={},
    reference_dataset_name="",
    reference_sequence_accession="",
    reference_dataset_tag="",
):
    return SampleQCMetric(
        sample=sample,
        qc_caller=qc_caller,
        qc_score=qc_score,
        qc_software_version=qc_software_version,
        qc_status=qc_status,
        raw_qc_output=raw_qc_output,
        reference_dataset_name=reference_dataset_name,
        reference_sequence_accession=reference_sequence_accession,
        reference_dataset_tag=reference_dataset_tag,
    )
