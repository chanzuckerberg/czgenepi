import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyS,
  fontHeaderXxl,
  getColors,
  getSpaces,
} from "czifui";
import { ContentStyles } from "src/common/styles/mixins/global";
import Instructions from "src/components/Instructions";

export function marginBottom(props: CommonThemeProps): string {
  const spaces = getSpaces(props);

  return `
    margin-bottom: ${spaces?.xl}px;
  `;
}

export const Header = styled.div`
  ${ContentStyles}

  display: flex;
  justify-content: space-between;
  align-items: center;

  ${(props) => {
    const colors = getColors(props);

    return `
      border-bottom: 5px solid ${colors?.gray[100]};
    `;
  }}
`;

export const Content = styled.div`
  flex: 2;

  ${ContentStyles}
`;

export const Title = styled.div`
  ${fontHeaderXxl}
`;

export const Subtitle = styled.div`
  ${fontBodyS}
`;

export const ButtonWrapper = styled.div`
  ${marginBottom}
`;

export const StyledInstructions = styled(Instructions)`
  ${marginBottom}
`;

export const ContinueButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;
