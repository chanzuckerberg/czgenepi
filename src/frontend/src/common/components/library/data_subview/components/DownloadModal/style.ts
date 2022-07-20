import styled from "@emotion/styled";
import {
  Button,
  Checkbox,
  fontBodyM,
  fontBodyS,
  fontBodyXs,
  fontBodyXxs,
  fontHeaderXl,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";

export const Header = styled.div`
  ${fontHeaderXl}
`;

export const Content = styled.div`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const Title = styled.span`
  ${fontBodyM}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const CheckBoxInfo = styled.div`
  ${fontBodyS}
  position: inline-block;
  float: left;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const Container = styled.div`
  display: grid;
`;

export const StyledSpan = styled.span`
  border-radius: 5px;
  ${(props) => {
    const colors = getColors(props);
    return `
      &:hover {
        background-color: ${colors?.gray[100]};
      }
    `;
  }}
`;

export const CheckBoxWrapper = styled.div`
  width: 500px;
  border-radius: 5px;
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
      &:hover {
        background-color: ${colors?.gray[100]};
      }
    `;
  }}
`;

export const DownloadType = styled.div`
  ${fontBodyXs}
  display: inline-block;
  color: black;
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xxl}px;
    `;
  }}
`;

export const DownloadTypeInfo = styled.div`
  ${fontBodyXxs}
  width: 400px;
`;

export const StyledCheckbox = styled(Checkbox)`
  padding-top: 0px;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
`;
