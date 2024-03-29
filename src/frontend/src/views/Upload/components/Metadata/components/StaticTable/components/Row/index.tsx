import { Icon } from "czifui";
import { memo } from "react";
import { getNameFromCollectionLocation } from "src/common/utils/locationUtils";
import { Metadata } from "src/components/WebformTable/common/types";
import { NO_CONTENT_FALLBACK } from "src/views/Upload/components/common/constants";
import { ValidationErrorRecord } from "../..";
import {
  Id,
  PrivateContent,
  PrivateTableCell,
  StyledLockIconWrapper,
  StyledTableCell,
  StyledTableRow,
  StyledAlertText,
  StyledExclamationMark,
} from "./style";

interface Props {
  id: string;
  metadata: Metadata;
  validationError: ValidationErrorRecord | null;
}

export default memo(function Row({
  id,
  metadata,
  validationError,
}: Props): JSX.Element {
  const {
    privateId,
    collectionDate,
    collectionLocation,
    sequencingDate,
    keepPrivate,
    publicId,
  } = metadata;

  const validatedCellData: Record<
    string,
    React.ReactElement | string | undefined
  > = {
    privateId: privateId || NO_CONTENT_FALLBACK,
    collectionDate: collectionDate || NO_CONTENT_FALLBACK,
    collectionLocation:
      getNameFromCollectionLocation(collectionLocation) || NO_CONTENT_FALLBACK,
    sequencingDate: sequencingDate || NO_CONTENT_FALLBACK,
  };

  if (validationError != null) {
    Object.entries(validationError).forEach(([key, message]) => {
      // The validation error for a location is for an id,
      // which is internal and not something a user would know about.
      // The only case in which the field does not validate is if the
      // value is missing entirely.
      if (key == "collectionLocation") {
        message = "Required";
      }
      validatedCellData[key] = (
        <>
          <p>{validatedCellData[key]}</p>
          <StyledAlertText>
            <StyledExclamationMark
              sdsIcon="exclamationMarkCircle"
              sdsSize="s"
              sdsType="static"
            />{" "}
            {message}
          </StyledAlertText>
        </>
      );
    });
  }

  return (
    <StyledTableRow>
      <StyledTableCell>
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell>{validatedCellData.privateId}</StyledTableCell>
      <StyledTableCell>{publicId || NO_CONTENT_FALLBACK}</StyledTableCell>
      <StyledTableCell>{validatedCellData.collectionDate}</StyledTableCell>
      <StyledTableCell>{validatedCellData.collectionLocation}</StyledTableCell>
      <StyledTableCell>{validatedCellData.sequencingDate}</StyledTableCell>
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
