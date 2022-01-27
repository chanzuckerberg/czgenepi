import styled from "@emotion/styled";
import { fontBodyXxs, getColors, getIconSizes, getSpaces, Props } from "czifui";
import { StyledInfoOutlinedIcon as InfoIcon } from "src/common/components/library/data_subview/components/CreateNSTreeModal/style";
import { TreeRowContent } from "src/common/components/library/data_table/style";

export interface ExtraProps extends Props {
  disabled?: boolean;
}

const doNotForwardProps = ["disabled"];

export const StyledRowContent = styled(TreeRowContent, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  flex: 2 0 40%;
  justify-content: left;

  ${(props: ExtraProps) => {
    const { disabled } = props;

    if (disabled) return;

    return `

      cursor: pointer;
    `;
  }}
`;

export const CellWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledNameWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledTreeCreator = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  ${fontBodyXxs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[500]};
      margin-top: ${spaces?.xxxs}px;
    `;
  }}
`;

const xSmallIcon = (props: Props) => {
  const iconSizes = getIconSizes(props);
  return `
    flex: 0 0 auto;
    height: ${iconSizes?.xs.height}px;
    width: ${iconSizes?.xs.width}px;
  `;
};

export const StyledInfoIcon = styled(InfoIcon)`
  ${xSmallIcon}
`;
