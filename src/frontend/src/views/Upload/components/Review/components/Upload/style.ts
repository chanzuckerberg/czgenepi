import styled from "@emotion/styled";
import { fontBodyS, fontHeaderXl, getColors, getSpacings } from "czifui";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import UploadImage from "./Upload.svg";
import UploadFailedImage from "./UploadFailed.svg";

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

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.xl}px;
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

  width: 600px;
  flex-direction: column;
`;

export const StyledDialogActions = styled(DialogActions)`
  ${centerContent}
`;

export const StyledUploadImage = styled(UploadImage)`
  ${(props) => {
    const colors = getColors(props);

    return `
      fill: ${colors?.primary[400]};
    `;
  }}
`;

export const StyledUploadFailedImage = styled(UploadFailedImage)`
  ${(props) => {
    const colors = getColors(props);

    return `
      fill: ${colors?.error[400]};
    `;
  }}
`;
