import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontCaps,
  fontHeader,
  getColors,
  getSpaces,
} from "czifui";

export type CapsSizeType = "xxxxs" | "xxxs" | "xxs";
// font size used for list items
export type FontBodySizeType =
  | "s"
  | "xs"
  | "xxxs"
  | "xxs"
  | "m"
  | "l"
  | undefined;
export type SizeType = "xxxs" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
interface HeaderProps extends CommonThemeProps {
  headerSize: SizeType;
}
interface InstructionTitleProps extends HeaderProps {
  marginBottom?: SizeType;
}

const doNotForwardProps = [
  "buttonSize",
  "headerSize",
  "listPadding",
  "marginBottom",
];

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

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.s}px;
    `;
  }}
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
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
  ${headerSize}
`;

interface InstructionsButtonProps extends CommonThemeProps {
  buttonSize: CapsSizeType;
}

export const StyledInstructionsButton = styled(Button, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: InstructionsButtonProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.xs}px ${spaces?.s}px;

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

interface InstructionsWrapperProps extends CommonThemeProps {
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

export const Divider = styled.span`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[400]};
    `;
  }}
`;
