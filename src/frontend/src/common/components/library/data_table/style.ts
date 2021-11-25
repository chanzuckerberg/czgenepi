import styled from "@emotion/styled";
import { Checkbox, fontHeaderXs, getColors, getSpaces, Props } from "czifui";

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
    const align = header?.align ?? "left";
    const spaces = getSpaces(props);

    return `
      justify-content: ${align};
      padding: ${spaces?.l}px 0;
      margin-right: ${spaces?.m}px;
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
