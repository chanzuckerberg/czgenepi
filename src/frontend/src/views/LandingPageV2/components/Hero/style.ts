import styled from "@emotion/styled";

export const Heading = styled.h1`
    color: white;
    font-size: 42px;
    font-weight: 600;
    line-height: 58px;
    margin: 20px 0 0 0;

    @media (max-width: 768px) {
        font-size: 24px;
        line-height: 34px;
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
`;

export const HeroMaxWidthContainer = styled.div`
    display: flex;
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
    justify-content: center;

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

export const HeroImage = styled.div`
    width: 50%;
    margin-top: -120px;

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

export const Tagline = styled.p`
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    letter-spacing: 0.3px;
    margin-bottom: 0;
    margin-top: 22px;

    @media (max-width: 768px) {
        font-size: 14px;
        line-height: 23px;
    }
`;
