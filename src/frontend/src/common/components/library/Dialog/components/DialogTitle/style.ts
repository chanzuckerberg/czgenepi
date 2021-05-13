import styled from "@emotion/styled";
import { DialogTitle } from "@material-ui/core";
import { getSpacings, Props } from "czifui";
import { narrow } from "../common";

export interface ExtraProps extends Props {
  narrow?: boolean;
}

// (thuang): Please keep this in sync with the props used in `ExtraProps`
const doNotForwardProps = ["narrow"];

export const StyledDialogTitle = styled(DialogTitle, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ExtraProps) => {
    const spacings = getSpacings(props);

    return `
      padding: ${spacings?.xxl}px ${spacings?.xxl}px ${spacings?.xl}px ${spacings?.xxl}px;
    `;
  }}

  ${narrow}

  ${(props) => {
    const { narrow } = props;
    const spacings = getSpacings(props);

    if (!narrow) return "";

    return `
      padding-bottom: ${spacings?.s}px;
    `;
  }}
`;
