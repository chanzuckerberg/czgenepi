import { List, ListItem } from "czifui";
import React from "react";
import { Title, Wrapper } from "./style";

interface Props {
  title: string | undefined;
  items: React.ReactNode[];
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
      {title && <Title>{title}</Title>}
      <List ordered={ordered}>
        {items.map((item, index) => {
          return (
            <ListItem fontSize="s" key={index} ordered={ordered}>
              {item}
            </ListItem>
          );
        })}
      </List>
    </Wrapper>
  );
}
