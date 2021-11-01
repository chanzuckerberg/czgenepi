import styled from "@emotion/styled";
import {
  Button,
  fontCapsXxxs,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

export const HeaderWrapper = styled.div`
  ${fontHeaderXs}

  display: flex;
  align-items: center;
  color: black;
`;

export const StyledInstructionsButton = styled(Button)`
  ${fontCapsXxxs}

  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      margin-left: ${spaces?.xxxs}px;
      margin-top: ${spaces?.xxxs}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const Wrapper = styled.div`
  border-radius: 4px;
  color: black;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.gray[100]};
      margin-bottom: ${spaces?.xs}px;
      padding: ${spaces?.l}px;
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
