import styled from "@emotion/styled";
import {
  Button,
  fontBodyS,
  fontHeaderXxl,
  getColors,
  getSpaces,
  Props,
} from "czifui";
import Instructions from "src/components/Instructions";

export function marginBottom(props: Props): string {
  const spaces = getSpaces(props);

  return `
      margin-bottom: ${spaces?.xl}px;
    `;
}

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
        padding: ${spaces?.xl}px 125px;
        border-bottom: 5px solid ${colors?.gray[100]};
    `;
  }}
`;

export const Content = styled.div`
  flex: 2;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
        margin: ${spaces?.xxl}px 125px ${spaces?.l}px 125px;
    `;
  }}
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
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;
