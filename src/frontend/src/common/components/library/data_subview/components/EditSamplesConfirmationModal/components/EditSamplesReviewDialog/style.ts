import styled from "@emotion/styled";
import { Button, Callout, fontBodyXs, getColors, getSpaces } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";

export const StyledButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.m}px;
    `;
  }}
`;

export const CalloutContainer = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xl}px;
      margin-bottom: ${spaces?.xxl}px;
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  width: 100%;
`;

export const StyledCollapseContent = styled.div`
  ${fontBodyXs}
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;
      background-color: #f4eee4;
    `;
  }}
`;

export const CheckboxWrapper = styled.div`
  ${fontBodyXs}
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[600]};
      display: flex;
      align-items: baseline;
    `;
  }}
`;

export const StyledNewTabLink = styled(NewTabLink)`
  color: black;
  border-bottom: 1px dashed;

  &:hover,
  &:focus {
    text-decoration: none;
    border-bottom: 1px solid;
  }
`;
