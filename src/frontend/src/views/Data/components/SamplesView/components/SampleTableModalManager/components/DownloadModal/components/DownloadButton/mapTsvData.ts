// TODO-TR (mlila): consider moving or restructuring this blob
import { store } from "src/common/redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { SAMPLE_SUBHEADERS } from "src/views/Data/headers";
import { SAMPLE_HEADERS } from "src/views/Data/table-headers/sampleHeadersConfig";

export const mapTsvData = (checkedSamples: Sample[]): string[][] => {
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);

  const allHeaders: Header[] = [
    ...SAMPLE_HEADERS[pathogen],
    {
      key: "CZBFailedGenomeRecovery",
      sortKey: ["CZBFailedGenomeRecovery"],
      text: "Genome Recovery",
    },
  ];

  // define header row
  const tsvHeaders = allHeaders.flatMap((header) => {
    const { key, text } = header;

    // create multiple columns for more complex data types (such as lineage)
    if (SAMPLE_SUBHEADERS[key]) {
      return SAMPLE_SUBHEADERS[key].map((subheader) => subheader.text);
    }

    return text;
  });

  // define table data
  const tsvData = checkedSamples.map((sample) => {
    // for each sample, generate an array of values, one column at a time
    return allHeaders.flatMap((header) => {
      const { key } = header;
      const value = sample[key];

      // break this piece of data into multiple columns, if necessary
      if (typeof value === "object" && SAMPLE_SUBHEADERS[key]) {
        return SAMPLE_SUBHEADERS[key].map((subheader) =>
          String(value[subheader.key])
        );
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
