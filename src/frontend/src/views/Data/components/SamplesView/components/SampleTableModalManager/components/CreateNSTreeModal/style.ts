import styled from "@emotion/styled";
import { FormControlLabel, Radio } from "@mui/material";
import {
  CommonThemeProps,
  fontBodyS,
  fontBodyXxs,
  fontHeaderM,
  getColors,
  getPalette,
  getSpaces,
  Tooltip,
} from "czifui";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { P, transparentScrollbars } from "src/common/styles/basicStyle";
import { iconFillGrayHoverPrimary } from "src/common/styles/iconStyle";
import { MAX_MODAL_WIDTH } from "src/common/styles/mixins/global";
import Dialog from "src/components/Dialog";

const gray500 = (props: CommonThemeProps) => {
  const colors = getColors(props);

  return `
    color: ${colors?.gray[500]};
  `;
};

export const StyledDialog = styled(Dialog)`
  display: flex;
  align-items: center;
  justify-content: center;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin: ${spaces?.xxl}px;
    `;
  }}

  .MuiDialog-container {
    max-height: 100vh;
    ${transparentScrollbars}
  }

  .MuiDialog-paper {
    margin: 0;
    min-width: ${MAX_MODAL_WIDTH}px;
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  ${fontBodyS}
  ${gray500}

  padding-bottom: 0;
  overflow-y: auto;
  & > div:last-child {
    margin-bottom: 0;
  }
`;

export const Title = styled.span`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const StyledDialogTitle = styled(DialogTitle)`
  flex: 0 0 auto;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const FieldTitle = styled.div`
  ${fontHeaderM}
  color: black;
`;

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}
`;

export const StyledRadio = styled(Radio)`
  vertical-align: top;
  height: 20px;
  width: 20px;
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.s}px;
      color: ${colors?.gray[400]};
      &.Mui-checked {
        color: ${colors?.primary[500]};
      }
      &:hover {
        color: ${colors?.gray[500]};
      }
    `;
  }}
`;

export const TreeTypeSection = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.s}px;
    `;
  }}
`;

export const TreeTypeSubtext = styled(P)`
  ${(props: CommonThemeProps) => {
    const palette = getPalette(props);
    const spaces = getSpaces(props);
    return `
      color: ${palette?.common?.black};
      margin: 0 0 ${spaces?.s}px;
    `;
  }}
`;

export const TreeNameInfoWrapper = styled.div`
  display: flex;
  align-items: center;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const CreateTreeInfo = styled.p`
  ${fontBodyXxs}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[400]};
      margin: ${spaces?.l}px 0 0;
    `;
  }}
`;

interface SeparatorProps extends CommonThemeProps {
  marginSize: "l" | "xl";
  marginBottomSize?: "l" | "xl";
}

const doNotForwardProps = ["marginSize"];

export const Separator = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  height: 0;

  ${(props: SeparatorProps) => {
    const { marginSize, marginBottomSize } = props;
    const colors = getColors(props);
    const spaces = getSpaces(props);

    const margin = marginBottomSize
      ? `${spaces?.[marginSize]}px 0 ${spaces?.[marginBottomSize]}px 0`
      : `${spaces?.[marginSize]}px 0`;

    return `
      border-top: 1px solid ${colors?.gray[200]};
      margin: ${margin};
    `;
  }}
`;

export const StyledTooltip = styled(Tooltip)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xxs}px;
    `;
  }}
`;

interface FormControlProps extends CommonThemeProps {
  checked: boolean;
}

export const StyledFormControlLabel = styled(FormControlLabel)`
  display: flex;
  align-items: flex-start;
  border-radius: 5px;
  margin-left: 0px;
  margin-right: 0px;
  ${(props: FormControlProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    const checked = props.checked;
    return `
      &:hover {
        background-color: ${colors?.gray[100]};
      }
      background-color: ${checked ? colors?.gray[100] : "transparent"};
      margin-bottom: ${spaces?.s}px;
      padding: ${spaces?.l}px;
    `;
  }}
`;

export const StyledFooter = styled.div`
  flex: 0 0 auto;
  max-width: ${MAX_MODAL_WIDTH}px;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.xl}px ${spaces?.xxl}px ${spaces?.xxl}px;
    `;
  }}
`;
