import styled from "@emotion/styled";
import Bar from "./components/Bar";

export const Container = styled.div`
  display: flex;
`;

export const StepWrapper = styled.span`
  display: flex;
  position: relative;
  margin: 0 24px;

  &:first-of-type {
    margin-left: 0;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

export const StyledBar = styled(Bar)`
  position: absolute;
  top: 15px;
  left: 42px;
`;
