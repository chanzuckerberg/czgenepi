import { B } from "src/common/styles/basicStyle";
import AlertAccordion from "src/components/AlertAccordion";

/**
 * WARNING_CODE.UNKNOWN_DATA_FIELDS
 */
const WarningUnknownDataFields = (): JSX.Element => {
  const title = <B>Unknown data fields in metadata file weren’t imported.</B>;
  const message =
    "We encountered some unknown data fields in your file that we did not import. If you " +
    "are missing data, please double check that your column headers match our naming convention.";

  return (
    <AlertAccordion title={title} collapseContent={message} intent="warning" />
  );
};

export { WarningUnknownDataFields };
