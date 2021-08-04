import styled from "@emotion/styled";
import IconButton from "@material-ui/core/IconButton";
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
  getSpacings,
w} from "czifui";

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
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spacings?.l}px;
    `;
  }}
`;

export const CheckBoxInfo = styled.div`
  ${fontBodyS}
  position: inline-block;
  float: left;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.l}px; 
      margin-bottom: ${spacings?.l}px;
    `;
  }}
`;

export const Container = styled.div`
  display: grid;
`;

export const StyledSpan = styled.span`

`;

export const CheckBoxWrapper = styled.div`
  width: 500px;
  border-radius: 5px;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xxs}px;
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
    const spacings = getSpacings(props);
    return `
        margin-top: ${spacings?.l}px;
        `;
  }}
`;

export const DownloadTypeInfo = styled.div`
  ${fontBodyXxs}
  width: 400px;
`;

export const StyledIconButton = styled(IconButton)`
  float: right;
  padding: 0;
  &:hover {
    background-color: transparent;
  }
  ${(props) => {
    const spacings = getSpacings(props);
    return `
        padding-bottom: ${spacings?.l}px;
        `;
  }}
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
