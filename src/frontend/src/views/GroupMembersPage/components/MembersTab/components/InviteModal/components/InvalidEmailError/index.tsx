import React from "react";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import { StyledDiv } from "./style";

interface Props {
  invalidAddresses: string[];
}

const InvalidEmailError = ({ invalidAddresses }: Props): JSX.Element | null => {
  const numInvalid = invalidAddresses.length;
  if (!numInvalid) return null;

  const title = (
    <>
      <B>
        {numInvalid} {pluralize("email", numInvalid)}{" "}
        {pluralize("has", numInvalid)} invalid {pluralize("format", numInvalid)}{" "}
        and can’t be sent.{" "}
      </B>
      Please correct any errors and try sending again.
    </>
  );

  const content = (
    <div>
      {invalidAddresses.map((a) => (
        <StyledDiv key={a}>{a}</StyledDiv>
      ))}
    </div>
  );

  return (
    <AlertAccordion intent="error" title={title} collapseContent={content} />
  );
};

export { InvalidEmailError };
