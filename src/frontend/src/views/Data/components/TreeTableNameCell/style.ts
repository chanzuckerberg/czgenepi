import styled from "@emotion/styled";
import { getColors, getSpacings, Props } from "czifui";
import { RowContent } from "src/common/components/library/data_table/style";
import OpenInNewIcon from "src/common/icons/OpenInNew.svg";
import { icon } from "../../../../common/components/library/data_table/style";

export interface ExtraProps extends Props {
  disabled?: boolean;
}

const doNotForwardProps = ["disabled"];

export const StyledOpenInNewIcon = styled(OpenInNewIcon, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${icon}
  flex: 0 0 auto;

  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin: 0 0 0 ${spacings?.l}px;
    `;
  }}

  ${(props: ExtraProps) => {
    const { disabled } = props;
    const colors = getColors(props);

    if (disabled) {
      return `
        fill: ${colors?.gray[200]};
      `;
    }
  }}
`;

export const StyledRowContent = styled(RowContent, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  flex: 2 0 40%;

  ${(props: ExtraProps) => {
    const { disabled } = props;
    const colors = getColors(props);

    if (disabled) return;

    return `
      cursor: pointer;

      :hover {
        ${StyledOpenInNewIcon} {
          fill: ${colors?.primary[400]};
        }
      }

      :active {
        ${StyledOpenInNewIcon} {
          fill: ${colors?.primary[600]};
        }
      }
    `;
  }}
`;

export const CellWrapper = styled.div`
  display: flex;
  align-items: center;
`;
