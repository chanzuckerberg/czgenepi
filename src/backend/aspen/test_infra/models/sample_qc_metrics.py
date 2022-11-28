from aspen.database.models import SampleQCMetric


def sample_qc_metrics_factory(
    sample,
    qc_score="1",
    qc_software_version="1.0.0",
    qc_status="good",
    raw_qc_output={},
):
    return SampleQCMetric(
        sample=sample,
        qc_score=qc_score,
        qc_software_version=qc_software_version,
        qc_status=qc_status,
        raw_qc_output=raw_qc_output,
    )
