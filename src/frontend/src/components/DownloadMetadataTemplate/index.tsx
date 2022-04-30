import React from "react";
import { CSVLink } from "react-csv";

const TSV_SEPARATOR = "\t";

interface Props {
  rows: string[][];
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const SampleUploadDownloadTemplate = ({
  children,
  rows,
  headers,
  className,
}: Props): JSX.Element => {
  return (
    <CSVLink
      className={className}
      data={rows}
      headers={headers}
      filename="metadata_template.tsv"
      separator={TSV_SEPARATOR}
      data-test-id="download-tsv-link"
    >
      {children}
    </CSVLink>
  );
};

interface SampleEditTsvProps extends Props {
  instructions: string[][];
}

const SampleEditTsvTemplateDownload = ({
  children,
  rows,
  headers,
  instructions,
  className,
}: SampleEditTsvProps): JSX.Element => {
  return (
    <CSVLink
      className={className}
      filename="metadata_template.tsv"
      enclosingCharacter={""}
      separator={TSV_SEPARATOR}
      data={[...instructions, headers, ...rows]}
    >
      {children}
    </CSVLink>
  );
};

export { SampleUploadDownloadTemplate, SampleEditTsvTemplateDownload };
