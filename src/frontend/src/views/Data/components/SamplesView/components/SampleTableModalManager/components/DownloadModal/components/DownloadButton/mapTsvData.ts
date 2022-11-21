// TODO-TR (mlila): consider moving or restructuring this blob
import { SAMPLE_HEADERS, SAMPLE_SUBHEADERS } from "src/views/Data/headers";

interface DataMapProps {
  checkedSamples: Sample[];
  headers: Header[];
  subheaders: Record<string, SubHeader[]>;
}

export const mapTsvData = ({ checkedSamples }: DataMapProps): [string[][]] => {
  const allHeaders = [
    ...SAMPLE_HEADERS,
    {
      key: "CZBFailedGenomeRecovery",
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

      // break this piece of data into multiple columns, if necessary
      if (SAMPLE_SUBHEADERS[key]) {
        const value = sample[key];
        return SAMPLE_SUBHEADERS[key].map((subheader) =>
          String(value[subheader.key])
        );
      }

      // otherwise, return a single value for this column
      if (key == "CZBFailedGenomeRecovery") {
        return sample[key] ? "Failed" : "Success";
      } else {
        return String(sample[key]);
      }
    });
  });

  return [tsvHeaders, ...tsvData];
};
