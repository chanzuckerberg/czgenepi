import styled from "@emotion/styled";

export const Heading = styled.h1`
    color: white;
    font-size: 42px;
    font-weight: 600;
    line-height: 58px;
    margin-bottom: 0;
`;

export const HeroContainer = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(23.02% 98.87% at 9.45% 171.77%, #F91DC8 0%, rgba(249, 29, 200, 0) 100%), radial-gradient(45.62% 195.95% at 8.84% 187.62%, #511CC1 0%, rgba(81, 28, 193, 0) 100%), #000000;
    position: relative;
    width: 100%;
    height: auto;
    max-height: 600px;
`;

export const HeroText = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 452px;
    letter-spacing: 0.3px;
`;

export const Tagline = styled.p`
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    letter-spacing: 0.3px;
    margin-bottom: 0;
    margin-top: 22px;
`;

export const HeroImage = styled.div`
    margin-left: 60px
`;