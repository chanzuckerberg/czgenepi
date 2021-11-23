import styled from "@emotion/styled";
import { fontHeaderS, getColors, getIconSizes, getSpaces, Props } from "czifui";

interface AlignProps extends Props {
  align?: string;
  wide?: boolean;
}

export const StyledTableHeader = styled("div")`
  ${(props: AlignProps) => {
    const { align, wide } = props;
    const justify = align ?? "left";

    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);

    return `
      display: flex;
      align-items: baseline;
      flex-direction: row;
      justify-content: ${justify};
      padding-bottom: ${spaces?.m}px;
      width: 100%;

      &:first-of-type {
        flex: ${wide ? "2 0 40%" : ""};
      }

      svg {
        fill: black;
        width: ${iconSizes?.xs.width}px;
      }
  `;
  }}
`;

export const StyledHeaderCellContent = styled.div`
  ${fontHeaderS}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[500]};
      margin-right: ${spaces?.xxs}px;

      &:hover {
        color: black;
        cursor: default;
      }
    `;
  }}
`;
