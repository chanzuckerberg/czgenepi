import { List, ListItem } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { SemiBold, StyleDownloadTemplate, Title, Wrapper } from "./style";

interface Props {
  headers: string[];
  rows: string[][];
}

export default function Instructions({ headers, rows }: Props): JSX.Element {
  return (
    <Wrapper>
      <Title>Importing Files</Title>
      <List title="Importing Files">
        <ListItem fontSize="xs">
          <SemiBold>
            Please refer to the{" "}
            <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6160372401172-Uploading-data#step3">
              Upload and Updating Metadata
            </NewTabLink>{" "}
            help documentation for detailed instructions on setting up your file
            and troubleshooting error messages and warnings.
          </SemiBold>
        </ListItem>
        <ListItem fontSize="xs">
          You can only import one file at a time. Importing a new file will
          overwrite previously imported data.
        </ListItem>
      </List>
      <Title>File Requirements</Title>
      <List title="File Requirements">
        <ListItem fontSize="xs">
          <SemiBold>
            We recommend that you copy your metadata into our
            <StyleDownloadTemplate headers={headers} rows={rows}>
              TSV template
            </StyleDownloadTemplate>
            , but you can use your own TSV or CSV file as well.&nbsp;
          </SemiBold>
          Accepted file formats: TSV, CSV.
        </ListItem>
        <ListItem fontSize="xs">
          Column header naming conventions and metadata value formatting must
          match those found in the TSV template. See the help documentation
          above for more details.
        </ListItem>
        <ListItem fontSize="xs">
          Our TSV template includes some pre-filled data, including the sample
          names for the samples listed below.
        </ListItem>
      </List>
    </Wrapper>
  );
}
