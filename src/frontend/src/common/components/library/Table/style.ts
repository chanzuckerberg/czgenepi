import styled from "@emotion/styled";
import { MAX_CONTENT_WIDTH } from "src/common/styles/mixins/global";

export const DataRows = styled.div`
  height: 77vh;
  width: 100%;

  > div {
    display: inline-block;
  }
`;

export const Container = styled.div`
  max-width: ${MAX_CONTENT_WIDTH}px;
  margin: 0 auto;
`;
