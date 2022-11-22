import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces } from "czifui";

const loadingBackgroundAnimation = (props: CommonThemeProps) => {
  const colors = getColors(props);
  return `
    @keyframes loadingBackgroundAnimation {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: 10% 0;
      }
    }

    animation-name: loadingBackgroundAnimation;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;

    background: linear-gradient(
      to right,
      ${colors?.gray[100]} 10%,
      ${colors?.gray[200]} 18%,
      ${colors?.gray[200]} 22%,
      ${colors?.gray[100]} 30%
    );
    background-position: 0% 0;
    background-size: 200%;
  `;
};

export const Container = styled.div`
  display: flex;
  width: 100%;
`;

export const CellContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const Cell = styled.div`
  ${loadingBackgroundAnimation}

  width: 72px;
  height: 12px;
`;

const commonLoadingStyles = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    ${loadingBackgroundAnimation}
    margin: ${spaces?.xxs}px 0;
  `;
};

export const Column = styled.div`
  display: flex;
  width: 100%;
`;

export const Square = styled.div`
  ${loadingBackgroundAnimation}

  min-width: 40px;
  height: 40px;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.l}px 0;
    `;
  }}
`;

export const Bars = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Long = styled.div`
  ${commonLoadingStyles}

  width: 80%;
  height: 12px;
`;

export const Short = styled.div`
  ${commonLoadingStyles}

  width: 70%;
  height: 9px;
`;

export const Wrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xs}px ${spaces?.xxxs}px;
    `;
  }}
`;
