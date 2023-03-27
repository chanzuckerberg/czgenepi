import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces } from "czifui";
import { SmallerThanBreakpoint } from "src/common/styles/mixins/global";

export const CZBiohubLogo = styled.a`
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
`;

export const CZILogo = styled.a`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
  margin-left: 32px;
  padding-right: 20px;
  max-width: 100px;
`;

export const FooterBottomContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${SmallerThanBreakpoint(`
    flex-direction: column-reverse;
  `)}
`;

export const FooterBottomLink = styled.a``;

export const FooterBottomLinkDivider = styled.span`
  margin: 0 7px;
`;

export const FooterBottomLinks = styled.div``;

export const FooterBottomSeparator = styled.div`
  display: none;

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      ${SmallerThanBreakpoint(`
        display: block;
        width: 100%;
        margin: ${spaces?.l}px auto;
        height: 1px;
        background: ${colors?.gray[600]};
      `)}
    `;
  }}
`;

const footerText = () => {
  return `
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0.3px;
  `;
};

export const FooterContainer = styled.footer`
  background: black;
  color: white;
  padding: 64px 115px;

  & a {
    color: white;
    ${footerText}
  }

  ${SmallerThanBreakpoint(`
    padding: 32px 20px 42px 20px;
  `)}
`;

export const FooterLogoContainer = styled.a`
  width: 100%;
  max-width: 130px;
`;

export const FooterPartnerships = styled.div`
  ${footerText}

  display: flex;
  align-items: center;
  font-style: italic;

  ${SmallerThanBreakpoint(`
    flex-direction: column;
  `)}
`;

export const FooterTopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 72px;

  ${SmallerThanBreakpoint(`
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 50px;
  `)}
`;

export const FooterTopListItem = styled.li`
  list-style: none;
  display: flex;
  justify-content: center;
  text-align: center;
  margin-left: 39px;

  ${SmallerThanBreakpoint(`
    width: 100%;
    margin-left: 0;
    margin-top: 11px;
`)}
`;

export const FooterTopLink = styled.a`
  ${SmallerThanBreakpoint(`
    background: #262525;
    border-radius: 24px;
    padding: 7px 14px;
    width: 100%;
    max-width: 280px;
  `)}
`;

export const FooterTopLinks = styled.ul`
  display: flex;
  flex-direction: row;
  padding: 0;

  ${SmallerThanBreakpoint(`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 28px;
  `)}
`;

export const Span = styled.span``;
