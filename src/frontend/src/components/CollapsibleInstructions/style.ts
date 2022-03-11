import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontCaps,
  fontHeader,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

export type CapsSizeType = "xxxxs" | "xxxs" | "xxs";
export type SizeType = "xxxs" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
interface HeaderProps extends CommonThemeProps {
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

interface InstructionsButtonProps extends CommonThemeProps {
  buttonSize: CapsSizeType;
}

export const StyledInstructionsButton = styled(Button, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
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

export const InstructionsTitle = styled.div`
  ${fontHeaderXs}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;
