import styled from "@emotion/styled";
import { fontCapsXxxxs, fontHeaderL, getColors, getSpaces } from "czifui";

export const Title = styled.span`
  ${fontHeaderL}
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const IntroWrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const Wrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xxl}px;
    `;
  }}
`;

export const StyledUpdatedDate = styled.span`
  ${fontCapsXxxxs}
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
