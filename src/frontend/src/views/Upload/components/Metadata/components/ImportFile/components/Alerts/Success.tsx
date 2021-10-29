import { AlertTitle } from "@material-ui/lab";
import { Alert } from "czifui";
import React from "react";
import { Title } from "./common/style";

interface Props {
  filename: string;
}

export default function Success({ filename }: Props): JSX.Element {
  return (
    <Alert severity="success">
      <AlertTitle>
        <Title>{`${filename}`}</Title> loaded.
      </AlertTitle>
      We automatically filled in the metadata from your import in the fields
      below. Please double check and correct any errors.
    </Alert>
  );
}
