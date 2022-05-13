import React from "react";
import { getNameFromCollectionLocation } from "src/common/utils/locationUtils";
import { Metadata } from "src/components/WebformTable/common/types";
import {
  Id,
  IsPrivateContent,
  IsPrivateTableCell,
  StyledLock,
  StyledTableCell,
  StyledTableRow,
} from "src/views/Upload/components/Review/components/Table/components/Row/style";

interface Props {
  metadata: Metadata;
}

export default React.memo(function Row({ metadata }: Props): JSX.Element {
  const {
    privateId,
    collectionDate,
    collectionLocation,
    sequencingDate,
    keepPrivate,
    publicId,
  } = metadata;

  return (
    <StyledTableRow component="div">
      <StyledTableCell component="div">
        <Id>{privateId}</Id>
      </StyledTableCell>
      <StyledTableCell component="div">{publicId || "--"}</StyledTableCell>
      <StyledTableCell component="div">{collectionDate}</StyledTableCell>
      <StyledTableCell component="div">
        {getNameFromCollectionLocation(collectionLocation)}
      </StyledTableCell>
      <StyledTableCell component="div">
        {sequencingDate || "--"}
      </StyledTableCell>
      <IsPrivateTableCell align="center" component="div">
        {keepPrivate ? (
          <IsPrivateContent>
            <StyledLock fontSize="small" />
            Private
          </IsPrivateContent>
        ) : (
          "Public"
        )}
      </IsPrivateTableCell>
    </StyledTableRow>
  );
});
