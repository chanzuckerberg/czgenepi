import React from "react";
import UploadImage from "src/common/images/Upload.svg";
import {
  StyledButton,
  StyledImg,
  StyledSubtitle,
  StyledTitle,
  ViewWrapper,
} from "../../style";

interface Props {
  onClose(): void;
}

const SuccessView = ({ onClose }: Props): JSX.Element => {
  return (
    <ViewWrapper>
      <StyledImg>
        <UploadImage />
      </StyledImg>
      <StyledTitle>Update Complete!</StyledTitle>
      <StyledSubtitle>Your samples have been updated.</StyledSubtitle>
      <div>
        <StyledButton sdsType="primary" sdsStyle="rounded" onClick={onClose}>
          Go to Samples
        </StyledButton>
      </div>
    </ViewWrapper>
  );
};

export { SuccessView };
