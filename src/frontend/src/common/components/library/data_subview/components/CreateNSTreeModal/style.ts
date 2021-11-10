import styled from "@emotion/styled";
import { Dialog, FormControlLabel, Radio, TextField } from "@material-ui/core";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import {
  fontBodyS,
  fontBodyXxs,
  fontBodyXxxs,
  fontHeaderXs,
  getColors,
  getSpaces,
  Props,
  Tooltip,
} from "czifui";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";

export const StyledDialog = styled(Dialog)`
  display: flex;
  align-items: center;
  justify-content: center;

  .MuiDialog-container {
    max-height: 85%;
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  ${fontBodyS}

  width: 600px;
  padding-bottom: 0;
  overflow-y: auto;
  div:last-child {
    margin-bottom: 0;
  }

  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const Title = styled.span`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
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

export const StyledTextField = styled(TextField)`
  color: black;
  padding: 0px;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const FieldTitle = styled.div`
  ${fontHeaderXs}
  color: black;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledRadio = styled(Radio)`
  vertical-align: top;
  height: 20px;
  width: 20px;
  ${(props) => {
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
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.s}px;
    `;
  }}
`;

export const TreeNameInfoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const TreeNameTooLongAlert = styled.div`
  ${fontBodyXxxs}
  display: flex;
  align-items: center;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xxxs}px;
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const CreateTreeInfo = styled.div`
  ${fontBodyXxs}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[400]};
      margin-top: ${spaces?.l}px;
    `;
  }}
`;

interface SeparatorProps extends Props {
  marginSize: "l" | "xl";
}

const doNotForwardProps = ["marginSize"];

export const Separator = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  height: 0;

  ${(props: SeparatorProps) => {
    const { marginSize } = props;
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      border-top: 1px solid ${colors?.gray[200]};
      margin: ${spaces?.[marginSize]}px 0;
    `;
  }}
`;

export const StyledTooltip = styled(Tooltip)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)`
  width: 14px;
  height: 15px;
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
      &:hover {
        color: ${colors?.primary[400]};
      }

    `;
  }}
`;

export const TextFieldAlert = styled.div`
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.error[400]};
    `;
  }}
`;

export const StyledFormControlLabel = styled(FormControlLabel)`
  display: flex;
  align-items: flex-start;
  border-radius: 5px;
  margin-left: 0px;
  margin-right: 0px;
  ${(props) => {
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

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxl}px;
      margin-left: ${spaces?.xxl}px;
      margin-top: ${spaces?.xl}px;
    `;
  }}
`;
