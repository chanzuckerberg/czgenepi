import { Check } from "@material-ui/icons";
import React from "react";
import { Status } from "../common";
import { Container, StyledCircle, Text } from "./style";

export interface Props {
  text: string;
  step: "1" | "2" | "3";
  status: Status;
}

export default function Indicator({ status, text, step }: Props): JSX.Element {
  return (
    <Container>
      <StyledCircle status={status}>
        {status === "complete" ? <Check fontSize="small" /> : step}
      </StyledCircle>
      <Text>{text}</Text>
    </Container>
  );
}
