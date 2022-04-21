import React from "react";
import { DuplicateIdsError } from "./components/DuplicateIdsError";
import { WarningBadLocationFormat } from "./components/WarningBadLocationFormat";
import { WarningUnknownDataFields } from "./components/WarningUnknownDataFields";

interface Props {
  errorData?: any; // placeholder
}

// TODO (mlila): error data needs to be passed through this component to display messages. This state
// TODO          should be calculated and managed by the parent because we also need to add in the
// TODO          row input warning/error styles which will be based on the same data.
const ErrorsAndWarnings = ({ errorData }: Props): JSX.Element | null => {
  if (!errorData) return null;

  // TODO (mlila): some errors and warnings from upload flow need to be copied here
  return (
    <>
      <DuplicateIdsError />
      <WarningBadLocationFormat badSamples={[]} />
      <WarningUnknownDataFields />
    </>
  );
};

export { ErrorsAndWarnings };
