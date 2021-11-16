import styled from "@emotion/styled";

export const CZBiohubLogo = styled.div`
    max-width: 120px;
    padding-left: 20px;
`;

export const CZContainer = styled.div`
    display: flex;
    align-items: center;
    margin-left: 55px;

    @media (max-width: 992px) {
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
    }
`;

export const CZILogo = styled.div`
    margin-left: 32px;
    border-right: 1px solid #767676;
    padding-right: 20px;
    max-width: 100px;
`;

export const FooterBottomContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

export const FooterBottomLink = styled.a`
`;

export const FooterBottomLinkDivider = styled.span`
    margin: 0 7px;
`;

export const FooterBottomLinks = styled.div`
`;

export const FooterBottomSeparator = styled.div`
    display: none;

    @media (max-width: 768px) {
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

    @media (max-width: 768px) {
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

export const FooterTopLink = styled.a`

    @media (max-width: 768px) {
        background: #262525;
        border-radius: 24px;
        padding: 7px 14px;
        width: 100%;
        max-width: 280px;
        text-align: center;
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

    a + a {
        margin-left: 39px;

        @media (max-width: 768px) {
            margin-left: 0;
            margin-top: 11px;
        }
    }
`;

export const Span = styled.span``;
