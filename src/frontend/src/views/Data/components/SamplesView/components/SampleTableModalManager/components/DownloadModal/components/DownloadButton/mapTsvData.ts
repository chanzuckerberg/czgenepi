// TODO-TR (mlila): consider moving or restructuring this blob
import { store } from "src/common/redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import {
  SAMPLE_HEADERS,
  SAMPLE_HEADERS_TSV_ONLY,
} from "src/views/Data/tableHeaders/sampleHeadersConfig";
import { TableHeader, SubHeader } from "src/views/Data/tableHeaders/types";

export const mapTsvData = (checkedSamples: Sample[]): string[][] => {
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);
  const allHeaders: TableHeader<Sample>[] = [
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

  const expandSubHeaders = ({
    subHeaders,
    value,
  }: {
    subHeaders: SubHeader[];
    value: any;
  }): string[] => {
    return subHeaders.map((subHeader) => {
      const subHeaderValue = value[subHeader.key];
      return subHeaderValue ? String(subHeaderValue) : defaultEmptyValue;
    });
  };

  // define table data
  const tsvData = checkedSamples.map((sample) => {
    // for each sample, generate an array of values, one column at a time
    return allHeaders.flatMap((header) => {
      const { key, subHeaders } = header;
      const value = sample[key];

      // break this piece of data into multiple columns, if there are subheaders
      // for the tsv exports
      if (subHeaders && typeof value === "object") {
        // qcMetrics and lineage arrays can contain multiple values. for now,
        // we are just taking the first entry since no column should have more
        // than one value at the current moment (Dec. 2022)
        const shouldUseArrayFirstForExport = value instanceof Array;
        return shouldUseArrayFirstForExport
          ? expandSubHeaders({ subHeaders, value: value[0] })
          : expandSubHeaders({ subHeaders, value });
      }

      // this is just a regular key-value pair. Return a plain string.
      return String(value);
    });
  });

  return [tsvHeaders, ...tsvData];
};
