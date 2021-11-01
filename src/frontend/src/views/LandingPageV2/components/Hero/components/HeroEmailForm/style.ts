import styled from "@emotion/styled";

export const HeroEmailForm = styled.form`
    color: white;
    display: flex;
    align-items: center;
    filter: drop-shadow(0px 100px 80px rgba(0, 0, 0, 0.24)) drop-shadow(0px 41.7776px 33.4221px rgba(0, 0, 0, 0.172525)) drop-shadow(0px 22.3363px 17.869px rgba(0, 0, 0, 0.143066)) drop-shadow(0px 12.5216px 10.0172px rgba(0, 0, 0, 0.12)) drop-shadow(0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0969343)) drop-shadow(0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0674749));
    margin-top: 50px;
`;

export const EmailInput = styled.input`
    border-radius: 999px 0 0 999px;
    outline: none;
    border: none;
    padding: 13px 38px;
`;

export const SubmitButton = styled.button`
    color: white;
    border-radius: 0 999px 999px 0;
    outline: none;
    border: none;
    background: #7A41CE;
    padding: 13px 38px;
    cursor: pointer;
`;

export const SubmitIcon = styled.span`
    margin-left: 10px;
`;