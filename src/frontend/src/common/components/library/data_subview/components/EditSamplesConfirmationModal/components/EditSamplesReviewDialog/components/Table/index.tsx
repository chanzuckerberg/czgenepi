import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import {
  IdColumn,
  IsPrivateTableCell,
  Overflow,
  StyledTableCell,
  StyledTableContainer,
  StyledTableRow,
} from "src/views/Upload/components/Review/components/Table/style";
import { MetadataWithIdType } from "../../index";
import Row from "./components/Row";

interface Props {
  metadata: MetadataWithIdType;
}

const Table = ({ metadata }: Props): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);

  return (
    <Overflow>
      <form autoComplete="off">
        <StyledTableContainer>
          <MuiTable component="div" stickyHeader>
            <TableHead component="div">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore: spread types error */}
              <StyledTableRow {...({ component: "div" } as unknown)}>
                <StyledTableCell component="div">
                  <IdColumn>Private ID</IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].publicId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {
                    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen]
                      .collectionDate
                  }
                </StyledTableCell>
                <StyledTableCell component="div">
                  {
                    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen]
                      .collectionLocation
                  }
                </StyledTableCell>
                <StyledTableCell component="div">
                  Sequencing Date
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  Privacy
                </IsPrivateTableCell>
              </StyledTableRow>
            </TableHead>
            {metadata && (
              <TableBody component="div">
                {Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
                  return <Row key={sampleId} metadata={sampleMetadata} />;
                })}
              </TableBody>
            )}
          </MuiTable>
        </StyledTableContainer>
      </form>
    </Overflow>
  );
};

export { Table };
