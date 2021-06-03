import styled from "@emotion/styled";
import { fontBodyXs, fontHeaderXs, getColors, getSpacings } from "czifui";

export const Wrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);

    return `
      background-color: ${colors?.gray[100]};
      padding: ${spacings?.xl}px;
    `;
  }}
`;

export const Title = styled.div`
  ${fontHeaderXs}

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.xxs}px;
    `;
  }}
`;

export const ReImportDataItem = styled.p`
  ${fontBodyXs}

  margin-bottom: 0;
`;
