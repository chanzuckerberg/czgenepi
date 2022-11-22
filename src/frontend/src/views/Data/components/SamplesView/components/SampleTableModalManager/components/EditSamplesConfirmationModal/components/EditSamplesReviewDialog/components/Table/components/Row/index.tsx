import { Icon } from "czifui";
import { memo } from "react";
import { getNameFromCollectionLocation } from "src/common/utils/locationUtils";
import { Metadata } from "src/components/WebformTable/common/types";
import { NO_CONTENT_FALLBACK } from "src/views/Upload/components/common/constants";
import {
  Id,
  IsPrivateContent,
  IsPrivateTableCell,
  StyledTableCell,
  StyledTableRow,
} from "src/views/Upload/components/Review/components/Table/components/Row/style";
import { StyledLockIconWrapper } from "./style";

interface Props {
  metadata: Metadata;
}

export default memo(function Row({ metadata }: Props): JSX.Element {
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
      <StyledTableCell component="div">
        {publicId || NO_CONTENT_FALLBACK}
      </StyledTableCell>
      <StyledTableCell component="div">{collectionDate}</StyledTableCell>
      <StyledTableCell component="div">
        {getNameFromCollectionLocation(collectionLocation)}
      </StyledTableCell>
      <StyledTableCell component="div">
        {sequencingDate || NO_CONTENT_FALLBACK}
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
