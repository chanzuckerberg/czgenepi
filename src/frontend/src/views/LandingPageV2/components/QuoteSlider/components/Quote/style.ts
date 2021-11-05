import styled from "@emotion/styled";

export const Citation = styled.span`
    text-align: center;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0.3px;
    color: #FFF;
    align-self: flex-end;
`;

export const QuoteContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 720px;
    margin: 0 auto;
    padding-top: 80px;
    position: relative;

<<<<<<< HEAD
    @media (max-width: 1200px) {
        max-width: 600px;
    }

    @media (max-width: 768px) {
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 30px;
=======
    @media (max-width: 768px) {
        padding-left: 10%;
        padding-right: 10%;
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
    }
`;

export const QuoteIcon = styled.span`
    position: absolute;
<<<<<<< HEAD
    top: 15%;
    left: -8%;
    z-index: 2;

    @media (max-width: 768px) {
        position: relative;
        left: 0;
        top: 0;
        align-self: flex-start;
        padding-bottom: 30px;
    }
=======
    top: 20%;
    left: -8%;
    z-index: 2;
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
`;

export const QuoteText = styled.p`
    text-align: left;
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
    letter-spacing: 0.3px;
    color: #FFF;

    @media (max-width: 768px) {
        font-size: 16px;
        line-height: 22px;
    }
`;