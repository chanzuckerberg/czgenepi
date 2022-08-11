import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyS,
  fontHeaderXl,
  getColors,
  getSpaces,
} from "czifui";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import UploadImage from "src/common/images/Upload.svg";
import UploadFailedImage from "src/common/images/UploadFailed.svg";

export const Title = styled.span`
  ${fontHeaderXl}
`;

export const Subtitle = styled.div`
  ${fontBodyS}
`;

export const ImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

const centerContent = `
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledDialogContent = styled(DialogContent)`
  ${centerContent}

  flex-direction: column;
`;

export const StyledDialogActions = styled(DialogActions)`
  ${centerContent}
`;

export const StyledUploadImage = styled(UploadImage)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      fill: ${colors?.primary[400]};
    `;
  }}
`;

export const StyledUploadFailedImage = styled(UploadFailedImage)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      fill: ${colors?.error[400]};
    `;
  }}
`;
