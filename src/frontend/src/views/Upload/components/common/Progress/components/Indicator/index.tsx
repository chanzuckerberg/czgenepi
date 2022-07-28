import { Icon } from "czifui";
import React from "react";
import { Status } from "../common";
import { Container, StyledCircle, StyledIconWrapperWhite, Text } from "./style";

export interface Props {
  text: string;
  step: "1" | "2" | "3";
  status: Status;
}

export default function Indicator({ status, text, step }: Props): JSX.Element {
  return (
    <Container>
      <StyledCircle status={status}>
        {status === "complete" ? (
          <StyledIconWrapperWhite>
            <Icon sdsIcon="check" sdsSize="s" sdsType="static" />{" "}
          </StyledIconWrapperWhite>
        ) : (
          step
        )}
      </StyledCircle>
      <Text>{text}</Text>
    </Container>
  );
}
