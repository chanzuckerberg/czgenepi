import styled from "@emotion/styled";
import { fontBodyXs, fontHeaderXs, getSpaces } from "czifui";

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Label = styled.span`
  ${fontHeaderXs}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.m}px;
    `;
  }}
`;

export const Text = styled.span`
  ${fontBodyXs}
`;
