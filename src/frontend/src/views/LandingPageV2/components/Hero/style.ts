import styled from "@emotion/styled";

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

export const HeroContainer = styled.div`
    background: #000000;
    width: 100%;

    @media (max-width: 768px) {
        min-height: 710px;
    }
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

    & svg:nth-of-type(2) {
        display: none;
    }

    @media (max-width: 768px) {
        width: 100%;
        
        & svg:nth-of-type(1) {
            display: none;
        }

        & svg:nth-of-type(2) {
            display: block;
            width: 100%;
        }
    }

`;

export const NextstrainContainer = styled.div`
    position: absolute;
    right: 80px;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    width: 140px;

    span {
        color: white;
        font-size: 11px;
        line-height: 24px;
        letter-spacing: 0.3px;
        font-style: italic;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

export const Tagline = styled.p`
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    letter-spacing: 0.3px;
    margin-bottom: 0;
    margin-top: 22px;

    @media (max-width: 1200px) {
        font-size: 14px;
        line-height: 24px;
    }
`;
