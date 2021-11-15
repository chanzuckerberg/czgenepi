import styled from "@emotion/styled";

export const HeroEmailForm = styled.form`

    filter: drop-shadow(0px 100px 80px rgba(0, 0, 0, 0.24)) drop-shadow(0px 41.7776px 33.4221px rgba(0, 0, 0, 0.172525)) drop-shadow(0px 22.3363px 17.869px rgba(0, 0, 0, 0.143066)) drop-shadow(0px 12.5216px 10.0172px rgba(0, 0, 0, 0.12)) drop-shadow(0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0969343)) drop-shadow(0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0674749));
    margin-top: 50px;
    max-width: 500px;
    width: 100%;
    border-radius: 999px;
    display: flex;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
    }
`;

export const EmailInput = styled.input`

    border-radius: 999px 0 0 999px;
    outline: none;
    border: none;
    padding: 13px 38px;
    font-size: 16px;
    font-weight: 400;
    line-height: 26px;
    letter-spacing: 0.3px;

    &::placeholder {
        color: #545454;
    }

<<<<<<< HEAD
<<<<<<< HEAD
    @media (max-width: 1200px) {
        font-size: 13px;
        line-height: 21px;
    }

    @media (max-width: 768px) {
        border-radius: 999px;
=======
    @media (max-width: 768px) {
        border-radius: 999px;
        font-size: 13px;
        line-height: 21px;
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
=======
    @media (max-width: 1200px) {
        font-size: 13px;
        line-height: 21px;
    }

    @media (max-width: 768px) {
        border-radius: 999px;
>>>>>>> e8db3a0 (Footer nextstrain section removed and link styles updated. Intro section responsiveness improvements. Hero responsiveness improvements.)
        margin-bottom: 7px;
        width: 100%;
        padding: 13px;
        text-align: center;
    }
`;

export const SubmitButton = styled.button`
    color: white;
    border-radius: 0 999px 999px 0;
    outline: none;
    border: none;
    background: #5D18C2;
    padding: 13px 38px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    line-height: 26px;
    letter-spacing: 0.3px;

<<<<<<< HEAD
<<<<<<< HEAD
    @media (max-width: 1200px) {
        font-size: 13px;
        line-height: 21px;
    }

    @media (max-width: 768px) {
        border-radius: 999px;
=======
    @media (max-width: 768px) {
        border-radius: 999px;
        font-size: 13px;
        line-height: 21px;
>>>>>>> d76dee8 (header, footer, email form logic, updates to responsive styling)
=======
    @media (max-width: 1200px) {
        font-size: 13px;
        line-height: 21px;
    }

    @media (max-width: 768px) {
        border-radius: 999px;
>>>>>>> e8db3a0 (Footer nextstrain section removed and link styles updated. Intro section responsiveness improvements. Hero responsiveness improvements.)
        width: 100%;
    }
`;

export const SubmitIcon = styled.span`
    margin-left: 10px;
`;