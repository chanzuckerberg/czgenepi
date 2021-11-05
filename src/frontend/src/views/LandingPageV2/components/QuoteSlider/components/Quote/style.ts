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

    @media (max-width: 768px) {
        padding-left: 10%;
        padding-right: 10%;
    }
`;

export const QuoteIcon = styled.span`
    position: absolute;
    top: 20%;
    left: -8%;
    z-index: 2;
`;

export const QuoteText = styled.p`
    text-align: left;
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
    letter-spacing: 0.3px;
    color: #FFF;
`;