import styled from "@emotion/styled";
import { fontBodyXs, fontHeaderXs, getColors, getSpaces } from "czifui";
import DownloadTemplate from "../DownloadTemplate";

export const Wrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.gray[100]};
      padding: ${spaces?.xl}px;
    `;
  }}
`;

export const Title = styled.div`
  ${fontHeaderXs}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

export const ReImportDataItem = styled.p`
  ${fontBodyXs}

  margin-bottom: 0;
`;

export const StyleDownloadTemplate = styled(DownloadTemplate)`
  ${(props) => {
    const colors = getColors(props);

    return `
      margin-left: 2px;
      color: ${colors?.primary[400]};

      &:hover {
        color: ${colors?.primary[600]};
      }
    `;
  }}
`;
