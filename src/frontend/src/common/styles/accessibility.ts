// includes shared mixins for making components more accessible.

import styled from "@emotion/styled";

// Screen Reader Only - for use with aria-labelledby. Places the element
// visually off of the screen, but still has width and height so screen
// readers won't remove the element.
// https://webaim.org/techniques/css/invisiblecontent/#techniques
export const srOnly = (): string => {
  return `
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
};

export const accessibleFocusBorder = (): string => {
  return `
    &:focus-visible, &:has(:focus-visible) {
      outline: 5px auto Highlight;
      outline: 5px auto -webkit-focus-ring-color;
    }
  `;
};

export const HiddenLabel = styled.label`
  ${srOnly}
`;
