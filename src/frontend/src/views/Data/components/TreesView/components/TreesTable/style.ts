import styled from "@emotion/styled";
import { SortableHeader } from "src/views/Data/components/SortableHeader";

export const StyledSortableHeader = styled(SortableHeader)`
  width: "auto";
`;

export const StyledWrapper = styled.div`
  /* needed to keep search bar sticky */
  flex: 1 1 auto;
  overflow-y: auto;

  & > div {
    overflow: auto;
  }
`;
