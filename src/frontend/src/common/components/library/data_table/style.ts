import styled from "@emotion/styled";
import { Checkbox, getColors, getSpacings, Props } from "czifui";

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
  header?: string;
}

const doNotForwardProps = ["header"];

export const RowContent = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  display: flex;
  align-items: center;
  width: 100%;

  ${(props: ExtraProps) => {
    const { header } = props;
    const shouldCenter = header === "treeType";
    const spacings = getSpacings(props);

    return `
      justify-content: ${shouldCenter ? "center" : "left"};
      padding: ${spacings?.l}px 0;
      margin-right: ${spacings?.m}px;
  `;
  }}
`;

export const icon = (props: Props): string => {
  const colors = getColors(props);
  const spacings = getSpacings(props);

  return `
    margin: 0 ${spacings?.l}px;
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

export const HeaderCheckbox = styled(Checkbox)`
  padding: 0;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);

    return `
      padding-right: ${spacings?.l}px;
      padding-left: ${spacings?.m}px;
      padding-bottom: ${spacings?.l}px;
      &.MuiCheckbox-indeterminate {
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const CenteredTableHeader = styled.div`
  justify-content: center;
`;
