import styled from "@emotion/styled";
import { getColors, getFontWeights, getSpaces, List } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";

export const StyledNewTabLink = styled(NewTabLink)`
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const colors = getColors(props);

    return `
      font-weight: ${fontWeights?.semibold};
      &:hover {
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const StyledList = styled(List)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.m}px;
    `;
  }}
`;
