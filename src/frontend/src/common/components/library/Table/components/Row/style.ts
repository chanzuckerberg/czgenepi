import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontHeaderS,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

const sharedRowStyles = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);

  return `
    display: flex;
    align-items: center;
  `;
};

export const StyledRow = styled.div`
  ${fontHeaderXs}
  ${sharedRowStyles}

  ${(props) => {
    const colors = getColors(props);

    return `

      border-bottom: 1px ${colors?.gray[200]} solid;
      &:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;

export const StyledHeader = styled.div`
  ${fontHeaderS}
  ${sharedRowStyles}

  margin: 0;

  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.gray[500]};
      border-bottom: 4px ${colors?.gray[100]} solid;
    `;
  }}
`;
