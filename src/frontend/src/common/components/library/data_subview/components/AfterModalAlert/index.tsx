import React from "react";
import { BoldText, DismissButton, StyledAlert, StyledDiv } from "./style";

interface Props {
  alertClassName: string;
  alertSeverity: "error" | "info" | "success" | "warning";
  boldText?: string;
  lightText?: JSX.Element | string;
  handleDismiss?: () => void;
}

export const AfterModalAlert = ({
  alertClassName,
  alertSeverity,
  boldText,
  lightText,
  handleDismiss,
}: Props): JSX.Element => {
  return (
    <StyledAlert className={alertClassName} severity={alertSeverity}>
      <StyledDiv>
        {boldText && <BoldText>{boldText}</BoldText>}
        {lightText}
      </StyledDiv>
      {handleDismiss && (
        <DismissButton onClick={handleDismiss}>DISMISS</DismissButton>
      )}
    </StyledAlert>
  );
};
