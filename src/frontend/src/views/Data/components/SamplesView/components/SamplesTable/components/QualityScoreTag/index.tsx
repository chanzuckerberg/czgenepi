import { ChipProps } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { StatusChip } from "src/views/Data/components/StatusChip";

interface StatusLabel {
  label: string;
  status: NonNullable<ChipProps["status"]>;
}

type StatusLabelMap = Record<string, StatusLabel>;

const STATUS_LABELS: StatusLabelMap = {
  error: {
    label: "bad",
    status: "error",
  },
  success: {
    label: "good",
    status: "success",
  },
  warning: {
    label: "mediocre",
    status: "warning",
  },
  processing: {
    label: "processing",
    status: "pending",
  },
  failed: {
    label: "failed",
    status: "pending",
  },
};

const getLabelForQCMetric = (qcMetric: QCMetrics): StatusLabel => {
  if (!qcMetric) return STATUS_LABELS.processing;

  const qcStatus = qcMetric.qc_status;

  switch (qcStatus?.toLowerCase()) {
    case "good":
      return STATUS_LABELS.success;
    case "bad":
      return STATUS_LABELS.error;
    case "mediocre":
      return STATUS_LABELS.warning;
    case "failed":
      return STATUS_LABELS.failed;
    default:
      return STATUS_LABELS.processing;
  }
};

const PROCESSING_STATUS_TOOLTIP_TEXT = (
  <div>
    <div>
      This sample doesn’t currently have a quality score because it is still
      processing. Score will update when complete.
    </div>
  </div>
);

const GENERIC_STATUS_TOOLTIP_TEXT = (
  <div>
    <div>
      <b>Quality Score: </b> Overall QC score from Nextclade which considers
      genome completion and screens for potential contamination and sequencing
      or bioinformatics errors.{" "}
      <NewTabLink
        href={
          "https://docs.nextstrain.org/projects/nextclade/en/stable/user/algorithm/07-quality-control.html"
        }
      >
        Learn more
      </NewTabLink>
    </div>
  </div>
);

const FAILED_STATUS_TOOLTIP_TEXT = (
  <div>
    <div>
      QC may fail when the sequence processing failed due to quality, or if the
      uploaded sequence does not represent the correct pathogen
    </div>
  </div>
);

const LABEL_TO_TOOLTIP_TEXT: Record<string, JSX.Element> = {
  processing: PROCESSING_STATUS_TOOLTIP_TEXT,
  bad: GENERIC_STATUS_TOOLTIP_TEXT,
  good: GENERIC_STATUS_TOOLTIP_TEXT,
  mediocre: GENERIC_STATUS_TOOLTIP_TEXT,
  failed: FAILED_STATUS_TOOLTIP_TEXT,
};

interface Props {
  qcMetric: QCMetrics;
}

const QualityScoreTag = ({ qcMetric }: Props): JSX.Element => {
  const qcStatusLabel = getLabelForQCMetric(qcMetric);
  const { label, status } = qcStatusLabel;

  return (
    <StatusChip
      label={label}
      status={status}
      tooltipText={LABEL_TO_TOOLTIP_TEXT[label]}
    />
  );
};

export { QualityScoreTag };
