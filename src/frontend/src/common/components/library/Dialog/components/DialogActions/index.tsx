import { DialogActionsProps } from "@mui/material";
import { ExtraProps, StyledDialogActions } from "./style";

type Props = ExtraProps & DialogActionsProps;

const DialogActions = (props: Props): JSX.Element => {
  return <StyledDialogActions {...props} />;
};

export default DialogActions;
