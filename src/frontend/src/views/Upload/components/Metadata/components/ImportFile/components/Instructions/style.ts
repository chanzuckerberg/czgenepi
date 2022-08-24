import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXs,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";
import { SampleUploadDownloadTemplate } from "src/components/DownloadMetadataTemplate";

export const Wrapper = styled.div`
  ${(props: CommonThemeProps) => {
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

  ${(props: CommonThemeProps) => {
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

export const StyleDownloadTemplate = styled(SampleUploadDownloadTemplate)`
  ${(props: CommonThemeProps) => {
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
