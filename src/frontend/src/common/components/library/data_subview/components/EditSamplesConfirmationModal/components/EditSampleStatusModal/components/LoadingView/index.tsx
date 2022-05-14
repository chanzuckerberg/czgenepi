import { Button } from "czifui";
import React from "react";
import UploadImage from "src/common/images/Upload.svg";
import {
  StyledImg,
  StyledSubtitle,
  StyledTitle,
  ViewWrapper,
} from "../../style";
import { StyledLoadingSpinner } from "./style";

const LoadingView = (): JSX.Element => {
  return (
    <ViewWrapper>
      <StyledImg>
        <UploadImage />
      </StyledImg>
      <StyledTitle>Updating Your Samples</StyledTitle>
      <StyledSubtitle>Stay on this page until upload completes.</StyledSubtitle>
      <div>
        <Button
          disabled
          sdsType="primary"
          sdsStyle="rounded"
          startIcon={<StyledLoadingSpinner />}
        >
          Upload In-progress
        </Button>
      </div>
    </ViewWrapper>
  );
};

export { LoadingView };
