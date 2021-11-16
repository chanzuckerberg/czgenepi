import { List as RawList, ListItem } from "czifui";
import React from "react";
import { StyledListItem } from "./style";

interface Props {
  items: React.ReactNode[];
  ordered?: boolean;
  listItemsShiftedLeft?: "s" | "m" | "l" | "xl"; // this prob will be used in styling for adding margin left
}

const List = ({ items, ordered, listItemsShiftedLeft }: Props): JSX.Element => {
  return (
    <RawList ordered={ordered}>
      {items.map((item, index) => {
        return (
          <StyledListItem
            ordered={ordered}
            key={index}
            listItemsShiftedLeft={listItemsShiftedLeft}
          >
            {item}
          </StyledListItem>
        );
      })}
    </RawList>
  );
};

export default List;
