import { List, ListItem } from "czifui";
import React from "react";
import { Title, Wrapper } from "./style";

interface Props {
  title: string;
  items: string[];
  ordered?: boolean;
  className?: string;
}

export default function Instructions({
  items,
  ordered = false,
  title,
  className,
}: Props): JSX.Element {
  return (
    <Wrapper className={className}>
      <Title>{title}</Title>
      <List ordered={ordered}>
        {items.map((item) => {
          return (
            <ListItem fontSize="s" key={item} ordered={ordered}>
              {item}
            </ListItem>
          );
        })}
      </List>
    </Wrapper>
  );
}
