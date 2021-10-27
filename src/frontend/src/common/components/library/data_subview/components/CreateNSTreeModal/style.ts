import styled from "@emotion/styled";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import {
  Button,
  fontBodyS,
  fontBodyXs,
  fontBodyXxs,
  fontBodyXxxs,
  fontCapsXxxs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getIconSizes,
  getSpaces,
  Props,
  Tooltip,
} from "czifui";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import Instructions from "src/components/Instructions";

const InstructionsCommon = `
  color: black;
`;

export const StyledDialogContent = styled(DialogContent)`
  width: 600px;
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

export const StyledInstructions = styled(Instructions)`
  border-radius: 4px;
  color: black;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
      padding: ${spaces?.l}px;
    `;
  }}
`;

export const InstructionsSemiBold = styled.span`
  ${InstructionsCommon}
  ${fontBodyXs}
  ${(props: Props) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-bottom: ${spaces?.xxxs};
    `;
  }}
`;

export const InstructionsNotSemiBold = styled.span`
  ${InstructionsCommon}
  ${fontBodyXs}
`;

export const StyledInstructionsButton = styled(Button)`
  ${fontCapsXxxs}
  padding-left: 0px;
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-left: ${spaces?.m}px;
      padding-top: ${spaces?.xxs}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
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
      margin-bottom: ${spaces?.s}px;
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

export const StyledButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-top: ${spaces?.xxl}px;
      &:active {
        background-color: ${colors?.gray[400]};
      }
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

export const StyledErrorOutlinedIcon = styled(ErrorOutlineIcon)`
  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.error[400]};
      margin-right: ${spaces?.xs}px;
      height: ${iconSizes?.s.height}px;
      width: ${iconSizes?.s.width}px;
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

export const Content = styled.div`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
