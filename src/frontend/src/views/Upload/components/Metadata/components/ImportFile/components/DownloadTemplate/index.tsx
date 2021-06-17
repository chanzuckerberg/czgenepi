import React from "react";
import { CSVLink } from "react-csv";

const TSV_SEPARATOR = "\t";

interface Props {
  rows: string[][];
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export default function DownloadTemplate({
  children,
  rows,
  headers,
  className,
}: Props): JSX.Element {
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
}
