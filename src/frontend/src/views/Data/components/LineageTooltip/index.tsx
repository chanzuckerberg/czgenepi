import { Label, Text, Wrapper } from "./style";

interface Props {
  lineage: Lineage;
}

const DISPLAY_ORDER: Array<keyof Lineage> = [
  "lineage",
  "qc_status",
  "version",
  "last_updated",
  "scorpio_call",
  "scorpio_support",
];

export const LineageTooltip = ({ lineage }: Props): JSX.Element => {
  return (
    <>
      {DISPLAY_ORDER.map((key) => {
        let value = lineage[key];
        if (key === "last_updated") {
          // remove the ugly timestamp and just show date
          value = `${value?.slice(0, 10)}`;
        }
        return <Row key={key} label={key as keyof Lineage} text={value} />;
      })}
    </>
  );
};

const KEY_TO_LABELS = {
  last_updated: "Last Updated",
  lineage: "Lineage",
  qc_status: "QC Status",
  scorpio_call: "Scorpio Call",
  scorpio_support: "Scorpio Support",
  version: "Version",
};

function Row({ label, text }: { label: keyof Lineage; text: string }) {
  return (
    <Wrapper>
      <Label>{KEY_TO_LABELS[label]}:</Label> <Text>{text}</Text>
    </Wrapper>
  );
}
