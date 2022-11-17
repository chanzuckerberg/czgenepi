import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
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

export default function Table({ metadata }: Props): JSX.Element {
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
                  <IdColumn>
                    {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].sampleId}
                  </IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].privateId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].publicId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {
                    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen]
                      .collectionDate
                  }
                </StyledTableCell>
                <StyledTableCell component="div">
                  {
                    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen]
                      .collectionLocation
                  }
                </StyledTableCell>
                <StyledTableCell component="div">
                  {
                    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen]
                      .sequencingDate
                  }
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].keepPrivate}
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
