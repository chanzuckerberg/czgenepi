import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { Props as CommonProps } from "../../../common/types";
import Row from "./components/Row";
import {
  IdColumn,
  IsPrivateTableCell,
  Overflow,
  StyledTableCell,
  StyledTableContainer,
  StyledTableRow,
} from "./style";

interface Props {
  metadata: CommonProps["metadata"];
}

export default function SDSTable({ metadata }: Props): JSX.Element {
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
                  <IdColumn>
                    {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId}
                  </IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.privateId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.publicId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.collectionDate}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.collectionLocation}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sequencingDate}
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.keepPrivate}
                </IsPrivateTableCell>
              </StyledTableRow>
            </TableHead>
            {metadata && (
              <TableBody component="div">
                {Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
                  return (
                    <Row
                      key={sampleId}
                      id={sampleId}
                      metadata={sampleMetadata}
                    />
                  );
                })}
              </TableBody>
            )}
          </MuiTable>
        </StyledTableContainer>
      </form>
    </Overflow>
  );
}
