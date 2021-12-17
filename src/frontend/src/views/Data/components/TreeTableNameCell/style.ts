import styled from "@emotion/styled";
import { fontBodyXxs, getColors, getSpaces, Props } from "czifui";
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

export const StyledTreeCreator = styled.span`
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
