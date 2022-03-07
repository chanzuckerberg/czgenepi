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
interface InstructionTitleProps extends HeaderProps {
  marginBottom?: SizeType;
}

const doNotForwardProps = ["buttonSize", "headerSize", "listPadding"];

const headerSize = (props: HeaderProps) => {
  const { headerSize } = props;
  return fontHeader(headerSize);
};

export const HeaderWrapper = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  display: flex;
  align-items: baseline;
  color: black;

  ${headerSize}
`;

const marginBottomInstructionsTitle = (props: InstructionTitleProps) => {
  const { marginBottom } = props;
  const spaces = getSpaces(props);
  return `
    margin-bottom: ${spaces && marginBottom && spaces[marginBottom]}px;
  `;
};

export const InstructionsTitle = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${marginBottomInstructionsTitle}
  ${headerSize}
`;

export const SecondInstructionsTitle = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${marginBottomInstructionsTitle}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
  ${headerSize}
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
