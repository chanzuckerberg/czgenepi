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

  const collectionLocationName = () => {
    // collection location will always be a NamedGisaidLocation at this stage,
    // the only time collectionLocation will be a string is during tsv upload
    // where collectionLocation can be "DELETE" (when a user wants to clear a value)
    if (collectionLocation && typeof collectionLocation !== "string") {
      return collectionLocation.name;
    }
  };

  return (
    <StyledTableRow component="div">
      <StyledTableCell component="div">
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell component="div">{privateId}</StyledTableCell>
      <StyledTableCell component="div">{publicId || "--"}</StyledTableCell>
      <StyledTableCell component="div">{collectionDate}</StyledTableCell>
      <StyledTableCell component="div">
        {collectionLocationName()}
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
