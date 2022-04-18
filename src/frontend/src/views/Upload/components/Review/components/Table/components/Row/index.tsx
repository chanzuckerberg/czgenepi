import React from "react";
import { Metadata } from "src/components/WebformTable/common/types";
import {
  Id,
  IsPrivateContent,
  IsPrivateTableCell,
  StyledLock,
  StyledTableCell,
  StyledTableRow,
} from "./style";

interface Props {
  id: string;
  metadata: Metadata;
}

export default React.memo(function Row({ id, metadata }: Props): JSX.Element {
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
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell component="div">{privateId}</StyledTableCell>
      <StyledTableCell component="div">{publicId || "--"}</StyledTableCell>
      <StyledTableCell component="div">{collectionDate}</StyledTableCell>
      <StyledTableCell component="div">
        {collectionLocation!.name}
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
