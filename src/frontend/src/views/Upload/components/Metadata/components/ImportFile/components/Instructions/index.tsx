import { List, ListItem } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { P } from "src/common/styles/basicStyle";
import {
  SemiBold,
  StyledListItem,
  StyleDownloadTemplate,
  StyledP,
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
          <StyledP>
            <SemiBold>
              We recommend that you copy your metadata into our
              <StyleDownloadTemplate headers={headers} rows={rows}>
                TSV template
              </StyleDownloadTemplate>
              , but you can use your own TSV or CSV file as well.&nbsp;
            </SemiBold>
            Accepted file formats: TSV, CSV.
          </StyledP>
        </ListItem>
        <ListItem fontSize="xs">
          <StyledP>
            Column header naming conventions and metadata value formatting must
            match those found in the TSV template or the{" "}
            <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/">
              Nextstrain defaults
            </NewTabLink>
            . See the help documentation above for more details.
          </StyledP>
        </ListItem>
        <ListItem fontSize="xs">
          Our TSV template includes some pre-filled data, including the sample
          names for the samples listed below.
        </ListItem>
      </List>
    </Wrapper>
  );
}
