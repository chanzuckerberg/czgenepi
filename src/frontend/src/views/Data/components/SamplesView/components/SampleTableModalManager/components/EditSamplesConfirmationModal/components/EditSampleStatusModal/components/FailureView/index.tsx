import UploadFailedImage from "src/common/images/UploadFailed.svg";
import { B } from "src/common/styles/basicStyle";
import {
  StyledButton,
  StyledSubtitle,
  StyledTitle,
  ViewWrapper,
} from "../../style";
import { StyledCallout, StyledImg, StyledNewTabLink } from "./style";

interface Props {
  onClose(): void;
}

const FailureView = ({ onClose }: Props): JSX.Element => {
  return (
    <ViewWrapper>
      <StyledImg>
        <UploadFailedImage />
      </StyledImg>
      <StyledTitle>Update Failed</StyledTitle>
      <StyledSubtitle>
        <StyledCallout intent="error">
          <div>
            <B>
              Something went wrong, and we were unable to finish your upload.
            </B>
          </div>
          <div>
            You may retry or{" "}
            <StyledNewTabLink href="mailto:hello@czgenepi.org">
              contact us
            </StyledNewTabLink>{" "}
            for help.
          </div>
        </StyledCallout>
      </StyledSubtitle>
      <div>
        <StyledButton sdsType="primary" sdsStyle="rounded" onClick={onClose}>
          Back to Edit
        </StyledButton>
      </div>
    </ViewWrapper>
  );
};

export { FailureView };
