import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyS,
  fontHeaderS,
  getColors,
  getSpaces,
} from "czifui";

export const Table = styled.table`
  margin: 25px 0px;
  border-style: solid;
  width: 840px;
  height: 2458px;
  border-width: 1px;
  border-spacing: 0;

  td {
    text-align: left;

    ${(props: CommonThemeProps) => {
      const spaces = getSpaces(props);
      const colors = getColors(props);

      return `
        padding: ${spaces?.m}px 15px;
        border: 1px solid ${colors?.gray[300]};
      `;
    }}
  }
`;

export const TopRow = styled.tr`
  ${fontHeaderS}

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      background-color: ${colors?.gray[200]};
    `;
  }}

  td {
    text-align: center;
  }
`;

export const SectionRow = styled.tr`
  ${fontHeaderS}

  ${(props) => {
    const colors = getColors(props);

    return `
      background-color: ${colors?.gray[100]};
    `;
  }}


  td {
    text-align: center;
  }
`;

export const ContentRow = styled.tr`
  td {
    ${fontBodyS}
    vertical-align: top;
  }
`;

export const UnderLineHeader = styled.div`
  ${fontBodyS}
  margin-top: 30px;
  text-decoration: underline;
`;
