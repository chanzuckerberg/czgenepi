import { DialogTitleProps } from "@mui/material";
import { ExtraProps, StyledDialogTitle } from "./style";

type Props = ExtraProps & DialogTitleProps;

const DialogTitle = (props: Props): JSX.Element => {
  return <StyledDialogTitle {...props} />;
};

export default DialogTitle;
