import styled from "@emotion/styled";

export const Bar = styled.div`
    width: 17px;
    height: 1px;
    background-color: #FFFFFF;
    margin: 5px 0;
`;

export const ButtonLink = styled.a`
    display: inline-block;
    margin: 0 8px;
    padding: 7px 14px 6px 14px;
    border: 1px solid #FFFFFF;
    border-radius: 24px;
    width: 140px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0.3px;

    &:hover {
        background: #FFFFFF;
        color: #000000;
    }
`;

export const HeaderTopLinks = styled.div`
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
        display: none;
    }
`;

export const HeaderContainer = styled.div`
    background: black;
    color: white;

    & a  {
        color: white;
        font-size: 14px;
        font-weight: 400;
        line-height: 24px;
        letter-spacing: 0.3px;
    }
`;

export const HeaderLogoContainer = styled.a`
    width: 100%;
    max-width: 164px;
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
        max-width: 100px;
    }
`;

export const HeaderMaxWidthContainer = styled.div`
    max-width: 1440px;
    margin: 0 auto;
`;

export const HeaderTopContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 38px 60px;

    @media (max-width: 768px) {
        padding: 17px 20px;
    }

`;

export const MobileNavClose = styled.span`
    cursor: pointer;
    padding-right: 26px;
`;

export const MobileNavCloseContainer = styled.div`
    width: 100%;
    text-align: right;
    padding-top: 24px;
`;

export const MobileNavLink = styled.a`
    display: block;
    text-decoration: none;
    color: #000000 !important;
    @include font-body-xs;
    font-weight: 600;
    margin: 22px 0;
    transition: opacity 0.2s;
`;

export const MobileNavLinkContainer = styled.div`
    padding-top: 30px;
    padding-left: 40px;
`;

export const MobileNavSeparator = styled.div`
    width: 60px;
    height: 1px;
    background-color: #CCCCCC;
`;

export const MobileNavToggle = styled.div`
    display: none;
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
        display: inline-block;
        cursor: pointer;
    }
`;

export const MobileNavTray = styled.div`
    height: 100vh;
    width: 90%;
    max-width: 260px;
    position: fixed;
    right: 0;
    top: 0;
    background-color: #FFFFFF;
    z-index: 10;
    transition: all 0.4s;
`;

export const TextLink = styled.a`
    margin: 0 10px;
`;