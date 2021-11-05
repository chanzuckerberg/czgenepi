import styled from "@emotion/styled";

export const IntroContainer = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 0 22px;
    max-width: 1440px;
    margin: 0 auto;

    @media (max-width: 768px) {
        flex-direction: column;
    }
<<<<<<< HEAD
=======
`;

export const IntroCTAButton = styled.a`
    display: inline-block;
    background: white;
    color: #7A41CE;
    border: 1px solid #7A41CE;
    border-radius: 24px;
    padding: 7px 14px 6px;
    font-size: 13px;
    line-height: 20px;
    letter-spacing: 0.3px;
    text-align: center;

    &:hover {
        color: white;
        background: #7A41CE;
    }
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
`;

export const IntroDescription = styled.p`
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    letter-spacing: 0.3px;
    margin-bottom: 30px;
<<<<<<< HEAD

    @media (max-width: 1200px) {
        font-size: 14px;
        line-height: 24px;
    }
=======
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
`;

export const IntroHeading = styled.h2`
    font-size: 32px;
    font-weight: 600;
    line-height: 44px;
    letter-spacing: 0.3px;
    margin-bottom: 30px;
<<<<<<< HEAD

    @media (max-width: 1200px) {
        font-size: 26px;
        line-height: 34px;
    }

    @media (max-width: 768px) {
        font-size: 18px;
        line-height: 24px;
    }
=======
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
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

<<<<<<< HEAD
    @media (max-width: 1200px) {
        width: 100%;
    }

=======
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
    @media (max-width: 768px) {
        width: 100%;
        margin: 0 auto;
    }
`;