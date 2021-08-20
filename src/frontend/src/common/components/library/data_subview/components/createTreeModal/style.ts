import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {
  Button,
  fontBodyXs,
  fontCapsXxs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpacings,
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
      margin-right: ${spacings?.m}px;
      margin-bottom: ${spacings?.xxxs}px;
    `;
  }}
`;

export const StyledInstructions = styled(Instructions)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xs}px;
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
      margin-left: ${spacings?.m}px;
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
      &:checked {
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
      margin-bottom: ${spacings?.s}px;
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

export const StyledFormControlLabel = styled(FormControlLabel)`
  display: flex;
  align-items: flex-start;
`;

export const TreeNameInfoWrapper = styled.div`
  display: flex;
  align-items: center;
`;