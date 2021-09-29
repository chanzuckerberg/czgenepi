import styled from "@emotion/styled";
import CloseIcon from "@material-ui/icons/Close";
import { fontBodyS, getColors, getIconSizes, getSpacings, Link } from "czifui";
import IconInfo from "src/common/icons/IconInfo.svg";

// Note that how we use flex here depends on `DummyCenteringSpacer`.
// Explanation of what's going on commented with that component below.
export const Container = styled.div`
  width: 100%;
  min-height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      background-color: ${colors?.primary[400]};
      padding: ${spacings?.s}px ${spacings?.l}px;
    `;
  }}
`;

export const StyledIconInfo = styled(IconInfo)`
  fill: white;
  vertical-align: middle;
  ${(props) => {
    const iconSizes = getIconSizes(props);
    const spacings = getSpacings(props);
    return `
      width: ${iconSizes?.l.width}px;
      height: ${iconSizes?.l.height}px;
      margin-right: ${spacings?.m}px;
    `;
  }}
`;

// This exists to help center up the central block of text in the banner.
// Accomplishing all the styling in the spec was kind of difficult, so this
// is being used as a mild hack: we have a central block of text and a right-aligned
// "Close" X icon. But we don't have a left-aligned block to even things out.
// This is a fake block so we can use justify `space-between` on flex and
// accomplish the other two above requirements accordingly.
export const DummyCenteringSpacer = styled.div`
  width: 0px;
`;

// Both the margin-block and margin are here just to override defaults
// (margin-block is coming in from user agent, plain margin is an upstream CSS)
export const MainText = styled.p`
  ${fontBodyS}
  margin-block: 0;
  margin: 0;
  text-align: center;
  color: white;
`;

export const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;
  text-decoration-style: dashed;
  &:hover {
    color: white;
    text-decoration-line: underline;
    text-decoration-style: solid;
  }
`;

export const StyledCloseIcon = styled(CloseIcon)`
  color: white;
  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);
    const spacings = getSpacings(props);
    return `
      width: ${iconSizes?.l.width}px;
      height: ${iconSizes?.l.height}px;
      margin-left: ${spacings?.m}px;
      &:hover {
        color: ${colors?.primary[300]};
        cursor: pointer;
      }
    `;
  }}
`;
