import styled from "@emotion/styled";
import { fontBodyXxxs, getColors } from "czifui";

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;

  .MuiFormControlLabel-root {
    margin-right: 0;
  }
`;

export const WarningWrapper = styled.span`
  ${fontBodyXxxs}

  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.warning[600]};
    `;
  }}
`;
