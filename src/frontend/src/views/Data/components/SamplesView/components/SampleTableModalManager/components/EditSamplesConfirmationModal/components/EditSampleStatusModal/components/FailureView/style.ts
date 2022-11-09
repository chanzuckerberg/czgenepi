import styled from "@emotion/styled";
import { Callout, CommonThemeProps, getColors } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";

export const StyledImg = styled.div`
  height: 150px;
  width: 150px;

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      path {
        fill: ${colors?.error[400]};
      }
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  width: 100%;
`;

export const StyledNewTabLink = styled(NewTabLink)`
  color: black;
  border-bottom: 1px dashed black;

  &:hover {
    color: black;
    text-decoration: none;
  }
`;
