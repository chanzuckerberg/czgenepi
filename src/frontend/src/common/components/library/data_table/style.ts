import styled from "@emotion/styled";
import { Checkbox, fontHeaderXs, getColors, getSpaces, Props } from "czifui";
import { FixedSizeList } from "react-window";

export const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  ${(props) => {
    const colors = getColors(props);

    return `
      &:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;

export interface ExtraProps extends Props {
  header?: Header;
}

const doNotForwardProps = ["header"];

export const RowContent = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${fontHeaderXs}
  display: flex;
  align-items: center;
  width: 100%;

  ${(props: ExtraProps) => {
    const { header } = props;
    const align = header?.align ?? "center";
    const spaces = getSpaces(props);

    return `
      justify-content: ${align};
      padding: ${spaces?.l}px 0;
      margin-right: ${spaces?.m}px;
  `;
  }}
`;

export const TreeRowContent = styled.div`
  ${fontHeaderXs}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;

  ${(props: ExtraProps) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }}
`;

export const icon = (props: Props): string => {
  const colors = getColors(props);
  const spaces = getSpaces(props);

  return `
    margin: 0 ${spaces?.l}px;
    fill: ${colors?.gray[500]};
  `;
};

export const RowCheckbox = styled(Checkbox)`
  padding-right: 0px;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
`;

// Typically, fixed items are positioned relative to the viewport.
// However, elements that have any transform applied to them will
// create a viewport-like containing block, throwing off any fixed
// position descendants.
// https://www.w3.org/TR/css-transforms-1/
// This prevents the data table from turning into a viewport-in-a-viewport,
// essentially, which is required for notifications to be properly placed.
// `will-change` is an experimental browser perf optimization tag.
// It doesn't apply any actual styling. It's more of a heads up for the
// browser on how elements might change in the future.
export const StyledFixedSizeList = styled(FixedSizeList)`
  will-change: auto !important;
`;
