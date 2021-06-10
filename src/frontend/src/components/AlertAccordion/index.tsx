import { ErrorOutline } from "@material-ui/icons";
import { Alert, AlertProps } from "czifui";
import React from "react";

interface Props {
  title: React.ReactNode;
  message: React.ReactNode;
  severity: AlertProps["severity"];
  className?: string;
}

// TODO(thuang): This will be an accordion with collapse state!
export default function AlertAccordion({
  title,
  message,
  severity,
  className,
}: Props): JSX.Element {
  return (
    <Alert className={className} severity={severity} icon={<ErrorOutline />}>
      <div>{title}</div>
      {message}
    </Alert>
  );
}
