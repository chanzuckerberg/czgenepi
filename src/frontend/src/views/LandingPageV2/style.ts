import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyM,
  fontBodyS,
  fontBodyXs,
  fontHeaderXxl,
  getColors,
  getShadows,
  getSpaces,
} from "czifui";
import { PageContent } from "src/common/styles/mixins/global";
import ConsensusGenomes from "./ConsensusGenomes.svg";

export const Container = styled(PageContent)`
  display: flex;
  flex-direction: column;
`;

export const CardContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;

  ${(props: CommonThemeProps) => {
    const shadows = getShadows(props);
    const spaces = getSpaces(props);

    return `
      height: 360px;
      width: 400px;
      padding: ${spaces?.xxl}px ${spaces?.xl}px ${spaces?.xxl}px ${spaces?.xxl}px;
      box-shadow: ${shadows?.s};
    `;
  }}
`;

export const Left = styled.div`
  display: flex;
  flex-direction: column;

  /* (thuang): fill up remaining horizontal space */
  flex: 1;
`;

export const Right = styled.div`
  width: 70px;
  height: 70px;
`;

export const Title = styled.div`
  ${fontHeaderXxl}
  ${marginBottom}
`;

export const Content = styled.div`
  /* (thuang): fill up remaining vertical space */
  flex: 1;
  display: flex;

  ${fontBodyM}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const Main = styled.div`
  ${fontBodyM}
  ${marginBottom}
`;

export const Details = styled.div`
  ${fontBodyS}

  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Virus = styled(ConsensusGenomes)`
  width: 65px;
  height: 65px;
`;

export const Footer = styled.div`
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: green;
`;

export const FooterButtonContainer = styled.div`
  ${fontBodyXs}

  width: 260px;
  display: flex;
  justify-content: space-between;

  ${(props) => {
    const colors = getColors(props);

    return `
      &> a {
        color: ${colors?.gray[600]};
      }
    `;
  }}
`;

function marginBottom(props: CommonThemeProps) {
  const spaces = getSpaces(props);

  return `
      margin-bottom: ${spaces?.s}px;
    `;
}

export const LoadingText = styled.div``;
