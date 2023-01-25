import styled from "@emotion/styled";
import { PageContent } from "src/common/styles/mixins/global";

export const Container = styled(PageContent)`
  display: flex;
  flex-flow: column wrap;
  align-content: flex-start;
`;

export const StyledView = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;
