import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyS,
  fontBodyXs,
  fontBodyXxs,
  getColors,
  getFontWeights,
  getSpaces,
  InputCheckbox,
} from "czifui";

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

    const backgroundColor = isSelected ? `${colors?.gray[100]}` : "transparent"; // Default to "transparent if not disabled or selected"

    const textColor = isDisabled
      ? `${colors?.gray[400]}`
      : `${colors?.gray[600]}`;

    return `
      background-color: ${backgroundColor};
      color: ${textColor};
      &:hover {
        ${!isDisabled && `background-color: ${colors?.gray[100]};`}
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

  ${(props: StyledFileTypeItemProps) => {
    const fontWeights = getFontWeights(props);
    const colors = getColors(props);
    const { isDisabled } = props;
    const textColor = isDisabled
      ? `${colors?.gray[400]}`
      : `${colors?.gray[600]}`;

    return `
      color: ${textColor};
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const DownloadTypeInfo = styled.div`
  ${fontBodyXxs}
  width: 400px;
`;

export const StyledCheckbox = styled(InputCheckbox)`
  padding-top: 0;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
`;
