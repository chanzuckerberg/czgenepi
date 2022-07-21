import styled from "@emotion/styled";
import {
  Button,
  fontBodyS,
  fontHeaderXl,
  getColors,
  getCorners,
  getShadows,
  getSpaces,
} from "czifui";
import BlackLogo from "src/common/images/CZGenEpiLogoBlack.svg";
import { NarrowContainer } from "src/common/styles/basicStyle";

export const StyledNarrowContainer = styled(NarrowContainer)`
  max-width: 400px;
`;

export const ErrorContainer = styled.div`
  text-align: center;

  ${(props) => {
    const corners = getCorners(props);
    const shadows = getShadows(props);

    return `
      box-shadow: ${shadows?.l};
      border-radius: ${corners?.m}px;
    `;
  }}
`;

export const StyledBlackLogo = styled(BlackLogo)`
  width: 209px;
`;

export const Header = styled.div`
  height: 114px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) => {
    const colors = getColors(props);

    return `
      background-color: ${colors?.gray[100]};
    `;
  }}
`;

export const Body = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: 0 ${spaces?.xxl}px;
    `;
  }}
`;

export const IconWrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      margin-top: ${spaces?.xl}px;
      margin-bottom: ${spaces?.l}px;

      path {
        color: ${colors?.error[400]};
      }
    `;
  }}
`;

export const Title = styled.div`
  ${fontHeaderXl}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const Text = styled.div`
  ${fontBodyS}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xxl}px 0;
    `;
  }}
`;
