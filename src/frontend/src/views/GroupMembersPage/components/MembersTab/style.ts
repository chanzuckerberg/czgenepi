import styled from "@emotion/styled";
import { getSpaces, Tabs } from "czifui";

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledTabs = styled(Tabs)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.m}px;
    `;
  }}
`;
