import styled from "@emotion/styled";
import { NAV_BAR_HEIGHT_PX } from "src/components/NavBar";

export const PageContent = styled.div`
  height: calc(100% - ${NAV_BAR_HEIGHT_PX}px);
`;
