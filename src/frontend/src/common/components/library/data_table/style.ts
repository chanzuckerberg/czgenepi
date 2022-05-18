import styled from "@emotion/styled";
import {
  Checkbox,
  CommonThemeProps,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

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

export interface ExtraProps extends CommonThemeProps {
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

export const RowCheckbox = styled(Checkbox)`
  padding-right: 0px;
  &:hover {
    background-color: transparent;
    &.Mui-checked {
      background-color: transparent;
    }
  }
`;

export const Cell = styled.div`
  ${fontHeaderXs}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      display: flex;
      align-items: center;
      margin: ${spaces?.xs}px 0;
    `;
  }}
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TableContent = styled.div`
  height: 77vh;
  width: 100%;

  > div {
    display: inline-block;
  }
`;
