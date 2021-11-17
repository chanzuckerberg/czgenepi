import styled from "@emotion/styled";
import { getSpaces, List, Props } from "czifui";

interface ListProps extends Props {
  // this prop is used for indenting list items (undefined means list items will be indented 0px)
  marginLeft: "xs" | "s" | "m" | "l" | "xl" | undefined;
}

const doNotForwardProps = ["marginLeft"];

export const StyledList = styled(List, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ListProps) => {
    const { marginLeft } = props;
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces && marginLeft ? spaces[marginLeft] : 0}px;
    `;
  }}
`;
