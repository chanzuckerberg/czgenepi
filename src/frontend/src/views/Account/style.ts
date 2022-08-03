import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces, Icon } from "czifui";
import { H3, P } from "src/common/styles/basicStyle";
import { iconFillGray, iconFillWhite } from "src/common/styles/iconStyle";

const layoutPadding = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
      padding: ${spaces?.xl}px ${spaces?.xxl}px;
    `;
};

export const StyledHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  ${layoutPadding}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      border-bottom: ${spaces?.xxxs}px solid ${colors?.gray[200]};
    `;
  }}
`;

export const StyledSection = styled.section`
  ${layoutPadding}
  max-width: 550px;
`;

export const StyledRow = styled.div`
  display: flex;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: 0;
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const StyledH3 = styled(H3)`
  margin: 0;
`;

export const SubText = styled(P)`
  margin: 0;
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const GrayIcon = styled(Icon)`
  ${iconFillGray}
`;

export const WhiteIcon = styled(Icon)`
  ${iconFillWhite}
`;
