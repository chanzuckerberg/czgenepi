import { Icon, IconButton } from "czifui";
import React from "react";
import { FailureView } from "./components/FailureView";
import { LoadingView } from "./components/LoadingView";
import { SuccessView } from "./components/SuccessView";
import { StyledDialog, StyledDiv } from "./style";

export enum StatusModalView {
  NONE = "none",
  LOADING = "loading",
  SUCCESS = "success",
  FAILURE = "failure",
}

interface Props {
  onClose(): void;
  statusModalView: StatusModalView;
}

const EditSampleStatusModal = ({
  onClose,
  statusModalView,
}: Props): JSX.Element | null => {
  let view;

  switch (statusModalView) {
    case StatusModalView.LOADING:
      view = <LoadingView />;
      break;
    case StatusModalView.SUCCESS:
      view = <SuccessView onClose={onClose} />;
      break;
    case StatusModalView.FAILURE:
      view = <FailureView onClose={onClose} />;
      break;
    case StatusModalView.NONE:
    default:
      return null;
  }

  return (
    <StyledDialog open sdsSize="s">
      {statusModalView !== StatusModalView.LOADING && (
        <StyledDiv onClick={onClose}>
          <IconButton sdsType="tertiary" sdsSize="small" size="large">
            <Icon sdsIcon="xMark" sdsType="iconButton" sdsSize="s" />
          </IconButton>
        </StyledDiv>
      )}
      {view}
    </StyledDialog>
  );
};

export { EditSampleStatusModal };
