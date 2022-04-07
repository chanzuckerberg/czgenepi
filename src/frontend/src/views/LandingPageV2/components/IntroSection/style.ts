import styled from "@emotion/styled";
import { getSpaces } from "czifui";

export const IntroContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      @media (max-width: 1440px) {
        padding: 0 ${spaces?.l}px 0 0;
      }

      @media (max-width: 768px) {
        flex-direction: column;
        padding: 0 ${spaces?.l}px;
      }
    `;
  }}
`;

export const IntroDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
  letter-spacing: 0.3px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

export const IntroHeading = styled.h2`
  font-size: 32px;
  font-weight: 600;
  line-height: 44px;
  letter-spacing: 0.3px;
  margin-bottom: 30px;

  @media (max-width: 1200px) {
    font-size: 26px;
    line-height: 34px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 24px;
  }
`;

export const IntroImage = styled.div`
  margin-top: -90px;
  z-index: 4;
  height: auto;

  @media (max-width: 1200px) {
    margin-top: -80px;
  }

  @media (max-width: 768px) {
    margin-top: -120px;
  }
`;

export const IntroTextContainer = styled.div`
  width: 50%;
  max-width: 461px;
  margin-top: 70px;
  margin-left: 78px;

  @media (max-width: 1200px) {
    width: 100%;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 0 auto;
  }
`;
