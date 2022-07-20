import { Button, Icon } from "czifui";
import React from "react";
import UploadImage from "src/common/images/Upload.svg";
import { IconWrapperGray500 } from "src/common/styles/iconStyle";
import {
  StyledImg,
  StyledSubtitle,
  StyledTitle,
  ViewWrapper,
} from "../../style";

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
          startIcon={
            <IconWrapperGray500>
              <Icon sdsIcon="loading" sdsSize="l" sdsType="static" />
            </IconWrapperGray500>
          }
        >
          Upload In-progress
        </Button>
      </div>
    </ViewWrapper>
  );
};

export { LoadingView };
