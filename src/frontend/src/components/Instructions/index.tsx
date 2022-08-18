import { List, ListItem } from "czifui";
import * as React from "react";
import { Title, Wrapper } from "./style";

export type TitleSize = "s" | "m" | "l" | "xs" | "xxxs" | "xxs";

interface Props {
  title?: string | undefined;
  items: React.ReactNode[];
  ordered?: boolean;
  className?: string;
  titleSize?: TitleSize;
  bodySize?: TitleSize;
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
