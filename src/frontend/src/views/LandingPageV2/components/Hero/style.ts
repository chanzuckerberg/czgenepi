import styled from "@emotion/styled";
import { fontBodyM } from "czifui";

export const G = styled.g``;

export const Line = styled.line``;

export const Rect = styled.rect``;

export const Path = styled.path``;

export const Circle = styled.circle``;

export const Defs = styled.defs``;

export const Stop = styled.stop``;

export const LinearGradient = styled.linearGradient``;

export const ClipPath = styled.clipPath``;

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

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const HeroBackgroundSvg = styled.svg`
  @keyframes group-1-fade {
    0% {
      opacity: 0;
    }

    3% {
      opacity: 100%;
    }

    25% {
      opacity: 100%;
    }

    28% {
      opacity: 0%;
    }

    100% {
      opacity: 0%;
    }
  }

  @keyframes group-2-fade {
    0% {
      opacity: 0;
    }

    23% {
      opacity: 0%;
    }

    25% {
      opacity: 100%;
    }

    50% {
      opacity: 100%;
    }

    53% {
      opacity: 0%;
    }

    100% {
      opacity: 0%;
    }
  }

  @keyframes group-3-fade {
    0% {
      opacity: 0;
    }

    47% {
      opacity: 0%;
    }

    50% {
      opacity: 100%;
    }

    75% {
      opacity: 100%;
    }

    78% {
      opacity: 0%;
    }

    100% {
      opacity: 0%;
    }
  }

  @keyframes group-4-fade {
    0% {
      opacity: 0;
    }

    72% {
      opacity: 0%;
    }

    75% {
      opacity: 100%;
    }

    97% {
      opacity: 100%;
    }

    100% {
      opacity: 0%;
    }
  }

  #group-1,
  #group-2,
  #group-3,
  #group-4 {
    opacity: 0;
    animation-duration: 12s;
    animation-iteration-count: infinite;
    animation-delay: 0;
  }

  #group-1 {
    animation-name: group-1-fade;
  }

  #group-2 {
    animation-name: group-2-fade;
  }

  #group-3 {
    animation-name: group-3-fade;
  }

  #group-4 {
    animation-name: group-4-fade;
  }
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

  @media (max-width: 768px) {
    position: relative;
    left: 0;
    margin: 0 auto;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
    margin-bottom: 200px;
  }
`;

export const HeroMaxWidthContainer = styled.div`
  display: flex;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

export const HeroImage = styled.div`
  margin-top: -120px;
  margin-left: auto;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

export const NextstrainContainer = styled.div`
  position: absolute;
  right: 80px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  width: 140px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: none;
  }
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
