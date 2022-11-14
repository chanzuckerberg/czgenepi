import styled from "@emotion/styled";
import {
  Button,
  Callout,
  InputCheckbox,
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
  display: flex;
  flex-direction: column;
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

const checkBoxInfoSpacing = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    position: inline-block;
    float: left;
    margin-top: ${spaces?.l}px;
    margin-bottom: ${spaces?.l}px;
  `;
};

export const CheckBoxInfo = styled.div`
  ${checkBoxInfoSpacing}
`;

export const CheckboxLabel = styled.label`
  ${fontBodyS}
  ${checkBoxInfoSpacing}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

export const Container = styled.ul`
  list-style-type: none;
  display: grid;
  padding: 0;
  margin: 0;
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
      background-color: ${backgroundColor};
      &:hover {
        background-color: ${colors?.gray[100]};
      }
      margin-bottom: ${spaces?.xxs}px;
      &:last-child {
        margin-bottom: 0;
      }
    `;
  }}
`;

export const DownloadType = styled.div`
  ${fontBodyXs}
  display: inline-block;
  color: black;
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledButton = styled(Button)`
  max-width: fit-content;
  ${(props: CommonThemeProps) => {
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

export const StyledCheckbox = styled(InputCheckbox)`
  padding-top: 0px;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
`;

export const StyledCallout = styled(Callout)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      width: 100%;
    `;
  }}
`;
