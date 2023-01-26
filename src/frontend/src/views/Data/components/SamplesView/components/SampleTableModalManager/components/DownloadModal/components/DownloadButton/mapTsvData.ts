// TODO-TR (mlila): consider moving or restructuring this blob
import { store } from "src/common/redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import {
  SAMPLE_HEADERS,
  SAMPLE_HEADERS_TSV_ONLY,
} from "src/views/Data/tableHeaders/sampleHeadersConfig";

export const mapTsvData = (checkedSamples: Sample[]): string[][] => {
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);
  const allHeaders: Header[] = [
    ...SAMPLE_HEADERS[pathogen],
    ...SAMPLE_HEADERS_TSV_ONLY,
  ];

  // define header row
  const tsvHeaders = allHeaders.flatMap((header) => {
    const { text } = header;

    // create multiple columns for more complex data types (such as lineages)
    if (header.subHeaders) {
      return header.subHeaders.map((subHeader) => subHeader.text);
    }
    return text;
  });

  const defaultEmptyValue = "";
  // define table data
  const tsvData = checkedSamples.map((sample) => {
    // for each sample, generate an array of values, one column at a time
    return allHeaders.flatMap((header) => {
      const { key } = header;
      const value = sample[key];

      // break this piece of data into multiple columns, if necessary
      if (header.subHeaders && typeof value === "object") {
        if (key === "qcMetrics" || key === "lineages") {
          // qcMetrics and lineages can contain multiple entries, for now
          // we are just taking the first entry since no entry should have more
          // than one value at the current moment (Dec. 2022)
          const firstValue = value && value[0];
          if (firstValue) {
            return header.subHeaders.map((subHeader) => {
              const entry = firstValue[subHeader.key];
              if (entry) {
                return String(entry);
              } else {
                return defaultEmptyValue;
              }
            });
          } else {
            // fill row with default values if qcMetrics or lineages is empty
            return header.subHeaders.map(() => defaultEmptyValue);
          }
        } else {
          return header.subHeaders.map((subHeader) =>
            String(value[subHeader.key])
          );
        }
      }

      // otherwise, return a single value for this column
      if (key == "CZBFailedGenomeRecovery") {
        return value ? "Failed" : "Success";
      } else {
        return String(value);
      }
    });
  });

  return [tsvHeaders, ...tsvData];
};
