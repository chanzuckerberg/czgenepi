import styled from "@emotion/styled";

export const CZContainer = styled.div`
    display: flex;
    align-items: center;
    margin-left: 55px;

    @media (max-width: 768px) {
        flex-direction: column;
        margin: 0 auto;

        span {
            margin-bottom: 26px;
        }
    }
`;

export const CZLogoContainer = styled.div`
    display: flex;
    align-items: center;

    & img {

        &:first-of-type {
            margin-left: 32px;
            border-right: 1px solid #767676;
            padding-right: 20px;
            max-height: 37px; 

        }

        &:nth-of-type(2) {
            max-height: 15px;
            padding-left: 20px;
        }
    }
    
`;

export const FooterBottomContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 1200px) {
        flex-direction: column-reverse;
    }
`;

export const FooterBottomLinks = styled.div`

    & span {
        margin: 0 7px;
    }
`;

export const FooterBottomSeparator = styled.div`
    display: none;

    @media (max-width: 1200px) {
        display: block;
        width: 100%;
        margin: 23px auto;
        height: 1px;
        background: #545454;
    }
`;

export const FooterContainer = styled.div`
    background: black;
    color: white;
    padding: 64px 115px;

    @media (max-width: 768px) {
        padding: 32px 20px 42px 20px;
    }

    & a  {
        color: white;
        font-size: 14px;
        font-weight: 400;
        line-height: 24px;
        letter-spacing: 0.3px;
    }
`;

export const FooterLogoContainer = styled.div`
    width: 100%;
    max-width: 130px;
`;

export const FooterPartnerships = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    font-style: italic;
    line-height: 24px;
    letter-spacing: 0.3px;

    @media (max-width: 1200px) {
        flex-direction: column;
    }
`;

export const FooterTopContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 72px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 50px;
    }
`;

export const FooterTopLinks = styled.div`

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 28px;
    }

    a {
        background: #262525;
        border-radius: 24px;
        padding: 7px 14px;
        width: 100%;
        max-width: 280px;
        text-align: center;
    }

    a + a {
        margin-left: 39px;

        @media (max-width: 768px) {
            margin-left: 0;
            margin-top: 11px;
        }
    }
`;

export const NextstrainContainer = styled.div`
    display: flex;
    align-items: center;

    & img {
        max-width: 140px;
        margin-left: 18px;
    }

    @media (max-width: 1200px) {
        flex-direction: column;
        margin-bottom: 26px;


        span {
            margin-bottom: 26px;
        }
    }
`;