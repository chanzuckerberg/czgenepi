import { IconButton } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { AlertTitle } from "@material-ui/lab";
import { AlertProps } from "czifui";
import React, { useState } from "react";
import { StyledAlert } from "./style";

interface Props {
  title?: string;
  message: React.ReactNode;
  severity: AlertProps["severity"];
  className?: string;
}

export default function AlertAccordion({
  title,
  message,
  severity,
  className,
}: Props): JSX.Element {
  const [isShown, setIsShown] = useState(false);

  function handleClick() {
    setIsShown((prevState) => !prevState);
  }

  return (
    <StyledAlert
      className={className}
      severity={severity}
      action={
        <IconButton aria-label="expand" color="inherit" onClick={handleClick}>
          <ExpandMore fontSize="inherit" />
        </IconButton>
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {isShown && message}
    </StyledAlert>
  );
}
