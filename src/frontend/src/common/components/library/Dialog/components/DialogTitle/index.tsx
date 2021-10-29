import { DialogTitleProps } from "@material-ui/core";
import React from "react";
import { ExtraProps, StyledDialogTitle } from "./style";

type Props = ExtraProps & DialogTitleProps;

const DialogTitle = (props: Props): JSX.Element => {
  return <StyledDialogTitle {...props} />;
};

export default DialogTitle;
