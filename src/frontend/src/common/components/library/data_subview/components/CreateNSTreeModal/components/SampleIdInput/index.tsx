import { Button } from "czifui";
import { compact } from "lodash";
import React, { useState } from "react";
// import { useMutation } from "react-query";
import { InputInstructions } from "./components/InputInstructions";
import { StyledTextArea } from "./style";

const SampleIdInput = (): JSX.Element => {
  return (
    <>
      <InputInstructions />
    </>
  );
};

export { SampleIdInput };
