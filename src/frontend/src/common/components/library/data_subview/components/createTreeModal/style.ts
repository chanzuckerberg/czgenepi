import styled from "@emotion/styled";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";
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
  getSpacings,
  Props,
  Tooltip,
} from "czifui";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import Instructions from "src/components/Instructions";

const SmallImageSize = `
  width: 14px;
  height: 14px;
`;

const InstructionsCommon = `
  color: black;
`;

const AlertInstructionsCommon = `
  ${fontBodyXxxs}
  color: black;
`;

export const StyledDialogContent = styled(DialogContent)`
  width: 600px;
`;

export const Title = styled.span`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spacings?.l}px;
    `;
  }}
`;

export const StyledDialogTitle = styled(DialogTitle)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.l}px; 
    `;
  }}
`;

export const StyledTextField = styled(TextField)`
  color: black;
  padding: 0px;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.s}px; 
    `;
  }}
`;

export const FieldTitle = styled.div`
  ${fontHeaderXs}
  color: black;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xxs}px;
    `;
  }}
`;

export const StyledInstructions = styled(Instructions)`
  border-radius: 4px;
  color: black;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xs}px;
      padding: ${spacings?.l}px;
    `;
  }}
`;

export const InstructionsSemiBold = styled.span`
  ${InstructionsCommon}
  ${fontBodyXs}
  ${(props: Props) => {
    const fontWeights = getFontWeights(props);
    const spacings = getSpacings(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-bottom: ${spacings?.xxs}
    `;
  }}
`;

export const InstructionsNotSemiBold = styled.span`
  ${InstructionsCommon}
  ${fontBodyXs}
`;

export const AlertInstructionsSemiBold = styled.span`
  ${AlertInstructionsCommon}
  ${(props: Props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const AlertInstructionsNotSemiBold = styled.span`
  ${AlertInstructionsCommon}
`;

export const StyledInstructionsButton = styled(Button)`
  ${fontCapsXxxs}
  padding-left: 0px;
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-left: ${spacings?.m}px; 
      padding-top: ${spacings?.xxs}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const StyledRadio = styled(Radio)`
  vertical-align: top;
  ${(props) => {
    const colors = getColors(props);
    return `
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

export const TreeNameSection = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.s}px;
    `;
  }}
`;

export const TreeTypeSection = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.s}px;
      margin-bottom: ${spacings?.s}px;
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
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.xxxs}px;
      margin-bottom: ${spacings?.xl}px;
    `;
  }}
`;

export const CreateTreeInfo = styled.div`
  ${fontBodyXxs}
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[400]};
      margin-top: ${spacings?.l}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-top: ${spacings?.xxl}px;
      &:active {
        background-color: ${colors?.gray[400]};
      }
    `;
  }}
`;

export const StyledTooltip = styled(Tooltip)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-left: ${spacings?.xxs}px;
    `;
  }}
`;

export const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)`
  ${SmallImageSize}
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
  ${SmallImageSize}
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.error[400]};
      margin-right: ${spacings?.xs}px;
    `;
  }}
`;

export const StyledWarningIcon = styled(ReportProblemOutlinedIcon)`
  ${SmallImageSize}
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.xxs}px;
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
    const spacings = getSpacings(props);
    const checked = props.checked;
    return `
      &:hover {
        background-color: ${colors?.gray[100]};
      }
      background-color: ${checked ? colors?.gray[100] : "transparent"};
      margin-bottom: ${spacings?.s}px;
      padding: ${spacings?.l}px;
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
