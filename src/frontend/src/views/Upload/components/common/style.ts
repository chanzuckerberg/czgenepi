import styled from "@emotion/styled";
import {
  fontBodyS,
  fontHeaderXxl,
  getColors,
  getSpacings,
  Props,
} from "czifui";
import Instructions from "src/components/Instructions";

export function marginBottom(props: Props): string {
  const spacings = getSpacings(props);

  return `
      margin-bottom: ${spacings?.xl}px;
    `;
}

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);

    return `
        padding: ${spacings?.xl}px 125px;
        border-bottom: 5px solid ${colors?.gray[100]};
    `;
  }}
`;

export const Content = styled.div`
  flex: 2;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
        margin: ${spacings?.xxl}px 125px ${spacings?.l}px 125px;
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
