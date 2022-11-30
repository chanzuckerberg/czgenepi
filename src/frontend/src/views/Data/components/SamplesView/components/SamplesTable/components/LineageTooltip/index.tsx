import { Tooltip } from "czifui";
import { ReactNode } from "react";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { Label, Text, Wrapper } from "./style";

interface Props {
  children: ReactNode;
  lineage: Lineage;
}

const KEY_TO_LABELS = {
  last_updated: "Last Updated",
  lineage: "Lineage",
  qc_status: "QC Status",
  scorpio_call: "Scorpio Call",
  scorpio_support: "Scorpio Support",
  lineage_software_version: "Version",
};

const DISPLAY_ORDER: Array<keyof Lineage> = [
  "lineage",
  "qc_status",
  "lineage_software_version",
  "last_updated",
  "scorpio_call",
  "scorpio_support",
];

export const LineageTooltip = ({ children, lineage }: Props): JSX.Element => {
  const textRows = (
    <>
      {DISPLAY_ORDER.map((key) => {
        let value = lineage[key];
        if (key === "last_updated") {
          value = datetimeWithTzToLocalDate(value);
        }
        return (
          <Wrapper key={key}>
            <Label>{KEY_TO_LABELS[key]}:</Label> <Text>{value}</Text>
          </Wrapper>
        );
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
