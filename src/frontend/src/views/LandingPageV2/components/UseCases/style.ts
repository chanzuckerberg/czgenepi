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
<<<<<<< HEAD
    z-index: 2;
=======
>>>>>>> 68765c5 (next 12 build/image fixes. responsiveness updates for Footer and Use Cases sections. NavBarV2 bug fixes.)

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

export const UseCasesImage = styled.div`
    width: 100%;
    height: auto;
    z-index: 1;

    @media (max-width: 768px) {
        display: none;
    }
`;

export const UseCasesImageMobile = styled.div`

    display: none;

    @media (max-width: 768px) {
        display: block;
        width: 100%;
        max-width: 300px;
        height: auto;
        margin: 0 auto;
    }
`;