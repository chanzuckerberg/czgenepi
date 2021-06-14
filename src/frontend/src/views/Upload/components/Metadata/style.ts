import styled from "@emotion/styled";
import { Button, getSpacings, Props } from "czifui";
import Instructions from "src/components/Instructions";

function marginBottom(props: Props) {
  const spacings = getSpacings(props);

  return `
      margin-bottom: ${spacings?.xl}px;
    `;
}

export const StyledInstructions = styled(Instructions)`
  ${marginBottom}
`;

export const ContinueButton = styled(Button)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-right: ${spacings?.xs}px;
    `;
  }}
`;

export const ButtonWrapper = styled.div`
  ${marginBottom}
`;
