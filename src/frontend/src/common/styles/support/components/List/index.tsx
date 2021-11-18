import { ListItem } from "czifui";
import React from "react";
import { StyledList } from "./style";

interface Props {
  items: React.ReactNode[];
  ordered?: boolean;
  marginLeft?: "s" | "m" | "l" | "xl"; // this prop will be used in styling for adding margin left
}

const List = ({ items, ordered, marginLeft }: Props): JSX.Element => {
  return (
    <StyledList ordered={ordered} marginLeft={marginLeft}>
      {items.map((item, index) => {
        return (
          <ListItem ordered={ordered} key={index}>
            {item}
          </ListItem>
        );
      })}
    </StyledList>
  );
};

export default List;
