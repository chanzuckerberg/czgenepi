import { List, ListItem } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import {
  ReImportDataItem,
  StyleDownloadTemplate,
  Title,
  Wrapper,
} from "./style";

interface Props {
  headers: string[];
  rows: string[][];
}

export default function Instructions({ headers, rows }: Props): JSX.Element {
  return (
    <Wrapper>
      <Title>Import Instructions</Title>
      <List title="Import Instructions" ordered>
        <ListItem ordered fontSize="xs">
          Review the fields below, where you will find definitions and format
          requirements. Take special note of the required fields, these must be
          included in your import file.
        </ListItem>
        <ListItem ordered fontSize="xs">
          We recommend that you copy your metadata into our
          <StyleDownloadTemplate headers={headers} rows={rows}>
            TSV template
          </StyleDownloadTemplate>
          , but you can use your own TSV or CSV file as well.
        </ListItem>
        <ListItem ordered fontSize="xs">
          Make sure your column headers match our naming convention or the&nbsp;
          <NewTabLink
            href={
              "https://docs.nextstrain.org/projects/ncov/en/latest/reference/metadata-fields.html"
            }
          >
            Nextstrain defaults.
          </NewTabLink>
        </ListItem>
        <ListItem ordered fontSize="xs">
          Make sure your metadata values are in the correct format.
        </ListItem>
        <ListItem ordered fontSize="xs">
          Upload your TSV or CSV file by clicking on the “Select Metadata File”
          button below and selecting from your file browser. Only one file can
          be imported at a time.
        </ListItem>
        <ListItem ordered fontSize="xs">
          The metadata from your file will be imported into the table fields
          below. If there are errors, please make the necessary changes.
        </ListItem>
      </List>
      <Title>Re-Importing Data</Title>
      <ReImportDataItem>
        You may re-import data through the same method as described above.
        Imported files will overwrite all existing data in the table below.
      </ReImportDataItem>
    </Wrapper>
  );
}
