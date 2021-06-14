import { Alert } from "czifui";
import React from "react";

interface Props {
  filename: string;
}

export default function Success({ filename }: Props): JSX.Element {
  return (
    <Alert title={`${filename} loaded.`} severity="success">
      We automatically filled in the metadata from your import in the fields
      below. Please double check and correct any errors.
    </Alert>
  );
}
