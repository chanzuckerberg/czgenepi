import { Icon } from "czifui";
import React from "react";
import { getNameFromCollectionLocation } from "src/common/utils/locationUtils";
import { Metadata } from "src/components/WebformTable/common/types";
import {
  Id,
  IsPrivateContent,
  IsPrivateTableCell,
  StyledLockIconWrapper,
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
        {getNameFromCollectionLocation(collectionLocation)}
      </StyledTableCell>
      <StyledTableCell component="div">
        {sequencingDate || "--"}
      </StyledTableCell>
      <IsPrivateTableCell align="center" component="div">
        {keepPrivate ? (
          <IsPrivateContent>
            <StyledLockIconWrapper>
              <Icon sdsIcon="lock" sdsSize="s" sdsType="static" />
            </StyledLockIconWrapper>
            Private
          </IsPrivateContent>
        ) : (
          "Public"
        )}
      </IsPrivateTableCell>
    </StyledTableRow>
  );
});
