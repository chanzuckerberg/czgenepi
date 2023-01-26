import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXxs,
  fontHeaderXs,
  getColors,
  getSpaces,
  Tooltip,
} from "czifui";
import {
  iconFillGray,
  iconFillGrayHoverPrimary,
} from "src/common/styles/iconStyle";

export interface ExtraProps extends CommonThemeProps {
  disabled?: boolean;
}

const doNotForwardProps = ["disabled"];

export const StyledRowContent = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${fontHeaderXs}

  display: flex;
  align-items: center;
  justify-content: left;
  width: 100%;
  margin: 0;

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

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}
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
      height: ${spaces?.l}px;
    `;
  }}
`;

export const StyledDetailsTooltipTarget = styled.p`
  cursor: pointer;
`;

export const StyledTreeIconWrapper = styled.div`
  ${iconFillGray}
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.l}px 0 0;
    `;
  }}
`;

export const popperPropsSx = {
  sx: {
    "& .MuiTooltip-tooltip": {
      width: "350px",
      maxWidth: "none !important",
    },
    "& .MuiTable-root": {
      borderCollapse: "separate",
      borderSpacing: "8px",
    },
    "& .MuiTableRow-root": {
      verticalAlign: "top",
    },
    "& .MuiTableCell-root": {
      width: "25%",
    },
  },
};

export const StyledTooltip = styled(Tooltip)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xxs}px;
    `;
  }}
`;
