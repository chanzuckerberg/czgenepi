import styled from "@emotion/styled";
import { getSpaces, ListItem, Props } from "czifui";

interface ListItemProps extends Props {
  // this prop is used for indenting list items (undefined means list items will be indented 0px)
  listItemsShiftedLeft: "xs" | "s" | "m" | "l" | "xl" | undefined;
}

const doNotForwardProps = ["listItemsShiftedLeft"];

export const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ListItemProps) => {
    const { listItemsShiftedLeft } = props;
    const spaces = getSpaces(props);

    return `
      margin-left: ${
        spaces && listItemsShiftedLeft ? spaces[listItemsShiftedLeft] : 0
      }px;
    `;
  }}
`;
