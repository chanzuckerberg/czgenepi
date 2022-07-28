import styled from "@emotion/styled";
import {
  Button,
  Checkbox,
  CommonThemeProps,
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

export const Container = styled.ul`
  list-style-type: none;
  display: grid;
  padding: 0;
`;

interface StyledFileTypeItemProps extends CommonThemeProps {
  isDisabled?: boolean;
  isSelected?: boolean;
}

export const StyledFileTypeItem = styled.li`
  border-radius: 5px;
  ${(props: StyledFileTypeItemProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    const { isDisabled, isSelected } = props;

    const backgroundColor = isDisabled
      ? `${colors?.gray[400]}`
      : isSelected
      ? `${colors?.gray[100]}`
      : "transparent"; // Default to "transparent if not disabled or selected"

    return `
      margin-bottom: ${spaces?.xxs}px;
      background-color: ${backgroundColor};
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
