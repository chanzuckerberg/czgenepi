import styled from "@emotion/styled";
import { fontBodyM } from "czifui";
import { SmallerThanBreakpoint } from "src/common/styles/mixins/global";

export const Heading = styled.h1`
  color: white;
  font-size: 42px;
  font-weight: 600;
  line-height: 58px;
  margin: 20px 0 0 0;

  @media (max-width: 1200px) {
    font-size: 26px;
    line-height: 34px;
  }

  ${SmallerThanBreakpoint(`
    font-size: 24px;
  `)}
`;

export const HeroContainer = styled.div`
  background: #000000;
  width: 100%;
`;

export const HeroTextSection = styled.div`
  display: flex;
  flex-direction: column;
  letter-spacing: 0.3px;
  max-width: 500px;
  position: absolute;
  left: 120px;
  padding-top: 25px;

  ${SmallerThanBreakpoint(`
    position: relative;
    left: 0;
    margin: 0 auto;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
    margin-bottom: 200px;
  `)}
`;

export const HeroMaxWidthContainer = styled.div`
  display: flex;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  position: relative;

  ${SmallerThanBreakpoint(`
    flex-direction: column-reverse;
  `)}
`;

export const HeroImage = styled.div`
  margin-top: -117px;
  margin-left: auto;

  ${SmallerThanBreakpoint(`
    width: 100%;
    height: auto;
  `)}
`;

export const NextstrainContainer = styled.div`
  position: absolute;
  right: 80px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  width: 140px;
  cursor: pointer;

  ${SmallerThanBreakpoint(`
    display: none;
  `)}
`;

export const NextstrainLink = styled.a``;

export const PartnershipText = styled.span`
  color: white;
  font-size: 11px;
  line-height: 24px;
  letter-spacing: 0.3px;
  font-style: italic;
`;

export const Tagline = styled.p`
  ${fontBodyM}

  color: white;
  margin-bottom: 0;
  margin-top: 22px;

  @media (max-width: 1200px) {
    font-size: 14px;
    line-height: 24px;
  }
`;
