import { Status } from "./components/common";
import Indicator from "./components/Indicator";
import { Container, StepWrapper, StyledBar } from "./style";

interface Props {
  step: "1" | "2" | "3";
}

export default function Progress({ step }: Props): JSX.Element {
  const currentStep = Number(step);

  return (
    <Container>
      <StepWrapper>
        <Indicator step="1" text="Samples" status={getStatus(currentStep, 1)} />
        <StyledBar status={getStatus(currentStep, 1)} />
      </StepWrapper>
      <StepWrapper>
        <Indicator
          step="2"
          text="Metadata"
          status={getStatus(currentStep, 2)}
        />
        <StyledBar status={getStatus(currentStep, 2)} />
      </StepWrapper>
      <StepWrapper>
        <Indicator step="3" text="Review" status={getStatus(currentStep, 3)} />
      </StepWrapper>
    </Container>
  );
}

function getStatus(currentStep: number, step: number): Status {
  if (currentStep === step) return "active";

  if (currentStep > step) return "complete";

  return "default";
}
