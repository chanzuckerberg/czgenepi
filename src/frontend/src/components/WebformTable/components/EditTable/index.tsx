import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { useSelector } from "react-redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "../../common/constants";
import {
  IsPrivateTableCell,
  StyledTableCell,
  StyledTableRow,
} from "../../style";
import Row from "../Row";
import { TableProps } from "../UploadTable";

export default function EditTable({
  metadata,
  hasImportedMetadataFile,
  handleRowMetadata,
  applyToAllColumn,
  handleRowValidation,
  autocorrectWarnings,
  locations,
}: TableProps): JSX.Element {
  const pathogen = useSelector(selectCurrentPathogen);

  return (
    <MuiTable component="div" stickyHeader>
      <TableHead component="div">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore: spread types error */}
        <StyledTableRow {...({ component: "div" } as unknown)}>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen].privateId}
          </StyledTableCell>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen].publicId}
          </StyledTableCell>
          <StyledTableCell component="div">
            {
              SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen]
                .collectionDate
            }
          </StyledTableCell>
          <StyledTableCell component="div">
            {
              SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen]
                .collectionLocation
            }
          </StyledTableCell>
          <StyledTableCell component="div">
            {
              SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen]
                .sequencingDate
            }
          </StyledTableCell>
          <IsPrivateTableCell align="center" component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen].keepPrivate}
          </IsPrivateTableCell>
        </StyledTableRow>
      </TableHead>
      {metadata && (
        <TableBody component="div">
          {Object.entries(metadata).map(([sampleId, sampleMetadata], index) => {
            return (
              <Row
                isFirstRow={index === 0}
                key={sampleId}
                id={sampleId}
                metadata={sampleMetadata}
                hasImportedMetadataFile={hasImportedMetadataFile}
                handleMetadata={handleRowMetadata}
                applyToAllColumn={applyToAllColumn}
                handleRowValidation={handleRowValidation}
                warnings={autocorrectWarnings[sampleId]}
                locations={locations}
                shouldSkipIdColumn
                shouldShowEditedInputAsMarked
              />
            );
          })}
        </TableBody>
      )}
    </MuiTable>
  );
}
