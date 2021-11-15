import styled from "@emotion/styled";

export const UseCasesContainer = styled.div`
    margin: 105px auto;
    width: 100%;
    padding: 0 22px;
    max-width: 1310px;
    position: relative;
`;

export const UseCasesExampleContainer = styled.div`
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    margin-top: -9%;

    @media (max-width: 768px) {
        display: none;
    }
`;

export const UseCasesHeader = styled.h2`
    text-align: center;
    font-size: 32px;
    font-weight: 600;
    line-height: 44px;
    letter-spacing: 0.3px;
    position: absolute;
    width: 100%;
    top: 10%;

    @media (max-width: 1200px) {
        font-size: 26px;
        line-height: 34px;
        top: 7%;
    }

    @media (max-width: 768px) {
        position: relative;
        font-size: 18px;
        line-height: 24px;
        top: -10px;
    }
`;

export const UseCasesImage = styled.img`
    width: 100%;
    height: auto;

    @media (max-width: 768px) {
        display: none;
    }
`;

export const UseCasesImageMobile = styled.img`

    display: none;

    @media (max-width: 768px) {
        display: block;
        width: 100%;
        max-width: 300px;
        height: auto;
        margin: 0 auto;
    }
`;