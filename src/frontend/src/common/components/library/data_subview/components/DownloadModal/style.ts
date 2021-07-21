import styled from "@emotion/styled";
import IconButton from "@material-ui/core/IconButton";
import {
  Button,
  Checkbox,
  fontBodyM,
  fontBodyS,
  fontBodyXs,
  fontHeaderXl,
  getColors,
  getSpacings,
  Props,
} from "czifui";

export const Header = styled.div`
  ${fontHeaderXl}
  ${(props: Props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.s}px;
    `;
  }}
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
  position: inline-block;
  float: left;
  ${fontBodyS}
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

export const CheckBoxWrapper = styled.div`
  width: 500px;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xxs}px;
    `;
  }}
`;

export const DownloadType = styled.div`
  display: inline-block;
  font-weight: 600;
  color: black;
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
  ${fontBodyXs}
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
