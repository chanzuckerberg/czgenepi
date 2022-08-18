import { DialogContentProps } from "@mui/material";
import { ExtraProps, StyledDialogContent } from "./style";

type Props = ExtraProps & DialogContentProps;

const DialogContent = (props: Props): JSX.Element => {
  return <StyledDialogContent {...props} />;
};

export default DialogContent;
