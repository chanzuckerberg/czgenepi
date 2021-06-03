import { List, ListItem } from "czifui";
import React from "react";
import { ReImportDataItem, Title, Wrapper } from "./style";

const INSTRUCTIONS = [
  "Review the fields below, where you will find definitions and format " +
    "requirements. Take special note of the required fields, these must be " +
    "included in your import file.",
  "You can use your own TSV or copy your metadata into our TSV template.",
  "Make sure your column headers match our naming convention.",
  "Make sure your metadata values are in the correct format.",
  `Upload your TSV file by clicking on the “Select Metadata File” below ` +
    "and selecting from your file browser. Only one file can be imported at " +
    "a time.",
  "The metadata from your TSV will be imported into the table fields below. " +
    "If there are errors, please make the necessary changes.",
];

export default function Instructions(): JSX.Element {
  return (
    <Wrapper>
      <Title>Import Instructions</Title>
      <List title="Import Instructions" ordered>
        {INSTRUCTIONS.map((text) => (
          <ListItem key={text} ordered fontSize="xs">
            {text}
          </ListItem>
        ))}
      </List>
      <Title>Re-Importing Data</Title>
      <ReImportDataItem>
        You may re-import data through the same method as your first upload. Any
        data imported will overwrite existing data in the table below if we
        identify a matching column header.
      </ReImportDataItem>
      <ReImportDataItem>
        If you do not wish to overwrite a column, remove old data from the
        column from your new import.
      </ReImportDataItem>
    </Wrapper>
  );
}
