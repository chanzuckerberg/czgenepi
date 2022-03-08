import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontHeaderS,
  getColors,
  getIconSizes,
  getSpaces,
} from "czifui";

interface AlignProps extends CommonThemeProps {
  align?: string;
}

export const StyledSampleTableHeader = styled("div")`
  ${(props: AlignProps) => {
    const { align } = props;
    const justify = align ?? "center";

    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);

    return `
      display: flex;
      align-items: baseline;
      flex-direction: row;
      justify-content: ${justify};
      padding-bottom: ${spaces?.m}px;
      width: 100%;

      svg {
        fill: black;
        width: ${iconSizes?.xs.width}px;
      }
  `;
  }}
`;

export const StyledTreeTableHeader = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: baseline;
  flex-direction: row;
  justify-content: center;
  width: 150px;

  &:first-child {
    width: 100%;
    flex: 1 1 auto;
    justify-content: left;
  }

  ${(props) => {
    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);

    return `
      padding-bottom: ${spaces?.m}px;
      margin: 0 ${spaces?.m}px;
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
