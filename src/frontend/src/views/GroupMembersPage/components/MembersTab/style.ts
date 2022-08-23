import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces, Tabs } from "czifui";
import { MAX_CONTENT_WIDTH } from "src/common/styles/mixins/global";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: ${MAX_CONTENT_WIDTH}px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledTabs = styled(Tabs)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.m}px;
    `;
  }}
`;
