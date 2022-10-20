import { Icon } from "czifui";
import { memo } from "react";
import { getNameFromCollectionLocation } from "src/common/utils/locationUtils";
import { Metadata } from "src/components/WebformTable/common/types";
import { ValidationErrorRecord } from "../..";
import {
  Id,
  PrivateContent,
  PrivateTableCell,
  StyledLockIconWrapper,
  StyledTableCell,
  StyledTableRow,
  StyledCallout,
  StyledAlertText,
  StyledExclamationMark,
} from "./style";

interface Props {
  id: string;
  metadata: Metadata;
  validationError: ValidationErrorRecord | null;
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

  const validatedCellData: Record<string, React.ReactElement | string | undefined> = {
    "privateId": privateId || "--",
    "collectionDate": collectionDate || "--",
    "collectionLocation": getNameFromCollectionLocation(collectionLocation) || "--",
    "sequencingDate": sequencingDate || "--",
  }

  if (validationError != null) {
    console.log(id, metadata, validationError)
    Object.entries(validationError).forEach(([key, message]) => {
      if (key == "collectionLocation" && message) {
        message = "Required"
      }
      validatedCellData[key] = (<><p>{validatedCellData[key]}</p><StyledAlertText><StyledExclamationMark sdsIcon="exclamationMarkCircle" sdsSize="s" sdsType="static" /> {message}</StyledAlertText></>)
    })
  }

  return (
    <StyledTableRow>
      <StyledTableCell>
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell>{validatedCellData.privateId}</StyledTableCell>
      <StyledTableCell>{publicId || "--"}</StyledTableCell>
      <StyledTableCell>{validatedCellData.collectionDate}</StyledTableCell>
      <StyledTableCell>
        {validatedCellData.collectionLocation}
      </StyledTableCell>
      <StyledTableCell>
        {validatedCellData.sequencingDate}
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
