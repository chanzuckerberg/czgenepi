import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getIconSizes, getSpaces } from "czifui";

export interface ExtraProps extends CommonThemeProps {
  disabled?: boolean;
}

const doNotForwardProps = ["disabled"];

// TODO BEFORE MERGE! Remove these!

// This wrapper appropriately places a gap between the top of the menu
// and the icon that it is anchored to
export const StyledIconWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.xs}px 0;
    `;
  }}
`;

// TODO (mlila): replace all instances of this with an sds Icon when complete
export const StyledIcon = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  flex: 0 0 auto;

  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);

    return `
      cursor: pointer;
      color: ${colors?.primary[400]};
      svg {
        fill: ${colors?.primary[400]};
        path: ${colors?.primary[400]};
      }
      height: ${iconSizes?.s.height}px;
      width: ${iconSizes?.s.width}px;
    `;
  }}

  ${(props: ExtraProps) => {
    const { disabled } = props;
    const colors = getColors(props);

    if (disabled) {
      return `
        cursor: default;
        color: ${colors?.gray[300]};
        svg {
          fill: ${colors?.gray[300]};
          path: ${colors?.gray[300]};
        }
      `;
    }
  }}
`;

export const StyledActionWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: 0 ${spaces?.m}px;

      &:last-child {
        padding-right: 0;
      }
    `;
  }}
`;

export const StyledTreeActionMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  width: 150px;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }}
`;
