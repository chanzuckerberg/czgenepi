import { Tooltip } from "czifui";
import { ReactNode } from "react";
import { Label, Text, Wrapper } from "./style";

interface Props {
  children: ReactNode;
  lineage: Lineage;
}

const KEY_TO_LABELS = {
  lineage: "Lineage",
  qc_status: "QC Status",
  scorpio_call: "Scorpio Call",
  scorpio_support: "Scorpio Support",
  lineage_software_version: "Version",
  lineage_type: "Lineage Type",
  lineage_probability: "Lineage Probability",
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
  "scorpio_call",
  "scorpio_support",
  "reference_dataset_name",
  "reference_sequence_accession",
  "reference_dataset_tag",
];

export const LineageTooltip = ({ children, lineage }: Props): JSX.Element => {
  const textRows = (
    <>
      {DISPLAY_ORDER.map((key) => {
        const value = lineage[key];
        // skip certain keys for now that are extra and not included in current design
        if (
          !(
            key in
            [
              "reference_dataset_name",
              "reference_sequence_accession",
              "reference_dataset_tag",
              "lineage_type",
            ]
          )
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
      <>{children}</>
    </Tooltip>
  );
};
