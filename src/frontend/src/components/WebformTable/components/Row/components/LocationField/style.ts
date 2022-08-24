import styled from "@emotion/styled";
import {
  CommonThemeProps,
  Dropdown,
  getBorders,
  getColors,
  getSpaces,
} from "czifui";
import {
  doNotForwardProps,
  FormFieldProps,
} from "src/components/DateField/style";

export const StyledDiv = styled("div")`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding-right: ${spaces?.l}px;
    `;
  }}
`;

export const StyledDropdown = styled(Dropdown, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: FormFieldProps) => {
    const { isBackgroundColorShown } = props;
    const spaces = getSpaces(props);
    const borders = getBorders(props);
    const colors = getColors(props);

    return `
      padding-right: ${spaces?.l}px;
      background-color: ${isBackgroundColorShown && colors?.primary[200]};
      border: ${borders?.gray[300]};
      path {
        fill: ${colors?.gray[300]};
      }
      &:hover {
        border: ${borders?.gray[500]};
        path {
          fill: ${colors?.gray[600]}; 
        }
      }
    `;
  }}
`;
