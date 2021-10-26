import styled from "@emotion/styled";
import { fontHeaderL, getSpaces } from "czifui";

export const Title = styled.span`
  ${fontHeaderL}
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;

  ${(props) => {
    const spacings = getSpaces(props);

    return `
      margin-bottom: ${spacings?.s}px;
    `;
  }}
`;

export const IntroWrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${(props) => {
    const spacings = getSpaces(props);

    return `
      margin-bottom: ${spacings?.l}px;
    `;
  }}
`;

export const Wrapper = styled.div`
  ${(props) => {
    const spacings = getSpaces(props);

    return `
      margin-bottom: ${spacings?.xxl}px;
    `;
  }}
`;
