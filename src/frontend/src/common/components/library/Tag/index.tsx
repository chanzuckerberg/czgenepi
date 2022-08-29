import { TagProps } from "czifui";
import { StyledTag } from "./style";

const Tag = (props: TagProps): JSX.Element => {
  return <StyledTag {...props} />;
};

export { Tag };
