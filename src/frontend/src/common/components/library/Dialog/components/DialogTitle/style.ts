import styled from "@emotion/styled";
import { DialogTitle } from "@mui/material";
import { CommonThemeProps, getSpaces } from "czifui";
import { narrow } from "../common";

export interface ExtraProps extends CommonThemeProps {
  narrow?: boolean;
}

// (thuang): Please keep this in sync with the props used in `ExtraProps`
const doNotForwardProps = ["narrow"];

export const StyledDialogTitle = styled(DialogTitle, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ExtraProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.xxl}px ${spaces?.xxl}px ${spaces?.xl}px ${spaces?.xxl}px;
    `;
  }}

  ${narrow}

  ${(props) => {
    const { narrow } = props;
    const spaces = getSpaces(props);

    if (!narrow) return "";

    return `
      padding-bottom: ${spaces?.s}px;
    `;
  }}
`;
