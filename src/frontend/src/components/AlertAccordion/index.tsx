import React from "react";
import { Wrapper } from "./style";
import { StyledAlert, ErrorOutline } from "czifui";

interface Props {
  title: React.ReactNode;
  message: React.ReactNode;
  variant: "success" | "info" | "error" | "warning";
  className?: string;
}

// TODO(thuang): This will be an accordion with collapse state!
export default function AlertAccordion({
  title,
  message,
  variant,
  className,
}: Props): JSX.Element {
  return (
    <StyledAlert className={className} variant={variant} severity="error" icon={<ErrorOutline />}>
      <div>{title}</div>
      {message}
    </StyledAlert>
  );
}
