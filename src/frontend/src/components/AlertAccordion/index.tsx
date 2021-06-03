import React from "react";
import { Wrapper } from "./style";

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
    <Wrapper className={className} variant={variant}>
      <div>{title}</div>
      {message}
    </Wrapper>
  );
}
