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
    padding: ${spaces?.l}px;
  `;
};

export const StyledRow = styled.div`
  ${fontHeaderXs}
  ${sharedRowStyles}

  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  ${(props) => {
    const colors = getColors(props);

    return `
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
