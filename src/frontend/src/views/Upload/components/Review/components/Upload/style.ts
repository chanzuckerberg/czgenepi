import styled from "@emotion/styled";
import { fontBodyS, fontHeaderXl, getSpacings } from "czifui";
import Image from "next/image";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";

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

