import { Icon } from "czifui";
import { memo } from "react";
import { getNameFromCollectionLocation } from "src/common/utils/locationUtils";
import { Metadata } from "src/components/WebformTable/common/types";
import {
  Id,
  PrivateContent,
  PrivateTableCell,
  StyledLockIconWrapper,
  StyledTableCell,
  StyledTableRow,
} from "./style";

interface Props {
  id: string;
  metadata: Metadata;
  validationError: Record<string, string> | null;
}

export default memo(function Row({ id, metadata, validationError }: Props): JSX.Element {
  const {
    privateId,
    collectionDate,
    collectionLocation,
    sequencingDate,
    keepPrivate,
    publicId,
  } = metadata;

  // if (validationError != null) {
  //   console.log(id, metadata, validationError)
  // }

  return (
    <StyledTableRow>
      <StyledTableCell>
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell>{privateId}</StyledTableCell>
      <StyledTableCell>{publicId || "--"}</StyledTableCell>
      <StyledTableCell>{collectionDate}</StyledTableCell>
      <StyledTableCell>
        {getNameFromCollectionLocation(collectionLocation)}
      </StyledTableCell>
      <StyledTableCell>
        {sequencingDate || "--"}
      </StyledTableCell>
      <PrivateTableCell align="center">
        {keepPrivate ? (
          <PrivateContent>
            <StyledLockIconWrapper>
              <Icon sdsIcon="lock" sdsSize="s" sdsType="static" />
            </StyledLockIconWrapper>
            Private
          </PrivateContent>
        ) : (
          "Public"
        )}
      </PrivateTableCell>
    </StyledTableRow>
  );
});
