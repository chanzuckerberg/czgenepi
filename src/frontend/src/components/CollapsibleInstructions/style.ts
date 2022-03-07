import styled from "@emotion/styled";
import {
  Button,
  fontCaps,
  fontHeader,
  getColors,
  getSpaces,
  Props,
} from "czifui";

export type CapsSizeType = "xxxxs" | "xxxs" | "xxs";
export type SizeType = "xxxs" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
interface HeaderProps extends Props {
  headerSize: SizeType;
}

const doNotForwardProps = ["buttonSize", "headerSize", "listPadding"];

export const HeaderWrapper = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  display: flex;
  align-items: baseline;
  color: black;

  ${(props: HeaderProps) => {
    const { headerSize } = props;
    return fontHeader(headerSize);
  }}
`;

export const InstructionsTitle = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
  ${(props: HeaderProps) => {
    const { headerSize } = props;
    return fontHeader(headerSize);
  }}
`;

export const SecondInstructionsTitle = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
      margin-top: ${spaces?.l}px;
    `;
  }}
  ${(props: HeaderProps) => {
    const { headerSize } = props;
    return fontHeader(headerSize);
  }}
`;

interface InstructionsButtonProps extends Props {
  buttonSize: CapsSizeType;
}

export const StyledInstructionsButton = styled(Button, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const colors = getColors(props);

    return `
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
  ${(props: InstructionsButtonProps) => {
    const { buttonSize } = props;
    if (!buttonSize) return;
    return fontCaps(buttonSize);
  }}
`;

interface InstructionsWrapperProps extends Props {
  listPadding: SizeType;
}

export const InstructionsWrapper = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  border-radius: 4px;
  color: black;

  ${(props: InstructionsWrapperProps) => {
    const { listPadding } = props;
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.gray[100]};
      margin-bottom: ${spaces?.xs}px;
      padding: ${spaces?.[listPadding]}px;
    `;
  }}
`;
