import { Dialog } from "@material-ui/core";
import styled from "@emotion/styled";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import {
  Button,
  fontBodyXs,
  fontCapsXxs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpacings,
  Tooltip,
} from "czifui";
import Instructions from "src/components/Instructions";

export const StyledTextField = styled(TextField)`
  color: black;
`;

export const FieldTitle = styled.div`
  ${fontHeaderXs}
  color: black;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.l}px;
      margin-right: ${spacings?.xs}px;
      margin-bottom: ${spacings?.s}px;
    `;
  }}
`;

export const StyledInstructions = styled(Instructions)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xs}px;
      padding: ${spacings?.l};
    `;
  }}
`;

export const InstructionsSemiBold = styled.span`
  ${fontBodyXs}
  color: black;
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const InstructionsNotSemiBold = styled.span`
  ${fontBodyXs}
  color: black;
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.regular};
    `;
  }}
`;

export const StyledInstructionsButton = styled(Button)`
  ${fontCapsXxs}
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-right: ${spacings?.s}px;
      margin-top: ${spacings?.s}px;
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
      color: ${colors?.primary[500]};
      &.Mui-checked {
        color: ${colors?.primary[500]};
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
  display: flex;
  align-items: center;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.xs}px;
      margin-bottom: ${spacings?.xl}px;
    `;
  }}
`;

export const CreateTreeInfo = styled.div`
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
      margin-left: ${spacings?.xs}px;
    `;
  }}
`;

export const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[400]};
      &:hover {
        color: ${colors?.primary[400]};
      }
      margin-top: ${spacings?.xs}px;
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
    const spacings = getSpacings(props);
    return `
      color: ${colors?.error[400]};
      margin-right: ${spacings?.s}px;
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
    return `
      &:hover {
        background-color: ${colors?.gray[100]};
      }
      &:checked { 
        background-color: ${colors?.gray[100]};
      }
      margin-bottom: ${spacings?.s}px;
    `;
  }}
`;

export const StyledDialog = styled(Dialog)`
  min-width: 600px;
`;