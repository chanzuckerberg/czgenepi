import styled from "@emotion/styled";
import {
  Button,
  fontCaps,
  fontHeader,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

export const SizeType = "xxxs" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
interface HeaderProps extends Props {
  headerSize: SizeType;
}

const doNotForwardProps = ["buttonSize", "headerSize", "listPadding"];

export const HeaderWrapper = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  display: flex;
  align-items: center;
  color: black;

  ${(props: HeaderProps) => {
    const { headerSize } = props;
    return fontHeader(headerSize);
  }}
`;

interface InstructionsButtonProps extends Props {
  buttonSize: SizeType;
}

export const StyledInstructionsButton = styled(Button, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      margin-left: ${spaces?.xxxs}px;
      margin-top: ${spaces?.xxxs}px;
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

export const InstructionsTitle = styled.div`
  ${fontHeaderXs}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;
