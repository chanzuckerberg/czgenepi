import { map } from "lodash";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { B } from "src/common/styles/basicStyle";
import AlertAccordion from "src/components/AlertAccordion";
import { SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { ProblemTable } from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/common/ProblemTable";

/**
 * WARNING_CODE.BAD_LOCATION_FORMAT
 */
export type badLocationFormatSamples = {
  id: string;
  originalValue: string;
  updatedValue: string;
}[];
export interface BadLocationFormatProps {
  badSamples: badLocationFormatSamples;
}

const MessageBadLocationFormat = ({ badSamples }: BadLocationFormatProps) => {
  const pathogen = useSelector(selectCurrentPathogen);

  const tablePreamble =
    "You can update the data in the table below, or update your file and re-import.";

  const columnHeaders = [
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].currentPrivateID,
    "Data Column",
    "Imported Value",
    "Updated Value",
  ];

  const rows = map(badSamples, (sample) => {
    const { id, originalValue, updatedValue } = sample;
    return [id, "Collection Location", originalValue, updatedValue];
  });

  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
};

const WarningBadLocationFormat = ({
  badSamples,
}: BadLocationFormatProps): JSX.Element => {
  const title = (
    <span>
      <B>
        Some metadata was automatically updated in the fields below to match
        required formatting.
      </B>{" "}
      Please double check and correct any errors.
    </span>
  );

  return (
    <AlertAccordion
      title={title}
      collapseContent={<MessageBadLocationFormat badSamples={badSamples} />}
      intent="warning"
    />
  );
};

export { WarningBadLocationFormat };
