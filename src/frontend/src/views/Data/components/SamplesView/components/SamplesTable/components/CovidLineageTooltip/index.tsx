import { Tooltip } from "czifui";
import { LineageTooltipProps } from "../lineageTooltipConfig";
import { Label, Text, Wrapper } from "./style";

const KEY_TO_LABELS = {
  lineage: "Lineage",
  qc_status: "QC Status",
  scorpio_call: "Scorpio Call",
  scorpio_support: "Scorpio Support",
  lineage_software_version: "Version",
  lineage_type: "Lineage Type",
  lineage_probability: "Lineage Probability",
  last_updated: "Last Updated",
  reference_dataset_name: "Reference Dataset Name",
  reference_sequence_accession: "Reference Sequence Accession",
  reference_dataset_tag: "Reference Dataset Tag",
};

const DISPLAY_ORDER: Array<keyof Lineage> = [
  "lineage",
  "qc_status",
  "lineage_software_version",
  "lineage_type",
  "lineage_probability",
  "last_updated",
  "scorpio_call",
  "scorpio_support",
  "reference_dataset_name",
  "reference_sequence_accession",
  "reference_dataset_tag",
];

export const CovidLineageTooltip = ({
  children,
  lineage,
}: LineageTooltipProps): JSX.Element => {
  const textRows = (
    <>
      {DISPLAY_ORDER.map((key) => {
        const value = lineage[key];
        // skip certain keys for now that are extra and not included in current design
        if (
          ![
            "reference_dataset_name",
            "reference_sequence_accession",
            "reference_dataset_tag",
            "lineage_type",
          ].includes(key)
        ) {
          return (
            <Wrapper key={key}>
              <Label>{KEY_TO_LABELS[key]}:</Label> <Text>{value}</Text>
            </Wrapper>
          );
        }
      })}
    </>
  );

  return (
    <Tooltip
      followCursor
      title={textRows}
      width="wide"
      data-test-id="lineage-tooltip"
    >
      <div>{children}</div>
    </Tooltip>
  );
};
