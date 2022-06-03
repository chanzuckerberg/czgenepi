import { TagProps } from "czifui";
import React from "react";
import { StyledTag } from "./style";

const Tag = (props: TagProps): JSX.Element => {
  return <StyledTag {...props} />;
};

export { Tag };
