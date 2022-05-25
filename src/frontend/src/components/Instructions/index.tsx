import { List, ListItem } from "czifui";
import React from "react";
import { Title, Wrapper } from "./style";

interface Props {
  title?: string | undefined;
  items: React.ReactNode[];
  ordered?: boolean;
  className?: string;
  titleSize?: string;
  bodySize?: string;
}

export default function Instructions({
  items,
  ordered = false,
  title,
  titleSize = "xs",
  bodySize = "s",
  className,
}: Props): JSX.Element {
  return (
    <Wrapper className={className}>
      {title && <Title titleSize={titleSize}>{title}</Title>}
      <List ordered={ordered}>
        {items.map((item, index) => {
          return (
            <ListItem fontSize={bodySize} key={index} ordered={ordered}>
              {item}
            </ListItem>
          );
        })}
      </List>
    </Wrapper>
  );
}
