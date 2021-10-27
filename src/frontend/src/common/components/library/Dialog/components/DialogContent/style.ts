import styled from "@emotion/styled";
import { DialogContent } from "@material-ui/core";
import { getSpaces, Props } from "czifui";
import { narrow } from "../common";

export interface ExtraProps extends Props {
  narrow?: boolean;
}

// (thuang): Please keep this in sync with the props used in `ExtraProps`
const doNotForwardProps = ["narrow"];

export const StyledDialogContent = styled(DialogContent, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: 0 ${spaces?.xxl}px ${spaces?.xl}px ${spaces?.xxl}px;
    `;
  }}

  ${narrow}
`;
