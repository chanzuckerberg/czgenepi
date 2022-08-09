import styled from "@emotion/styled";
import { getColors, getSpaces } from "czifui";
import { H3, P } from "src/common/styles/basicStyle";
import { iconFillGray400, iconFillWhite } from "src/common/styles/iconStyle";
import { ContentStyles } from "src/common/styles/mixins/global";

export const StyledHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  ${ContentStyles}
`;

export const StyledDivider = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      height: ${spaces?.xxxs}px;
      width: 100%;
      background-color: ${colors?.gray[200]};
    `;
  }}
`;

export const StyledSection = styled.section`
  ${ContentStyles}
  max-width: 800px;
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
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
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

export const GrayIconWrapper = styled.div`
  ${iconFillGray400}
`;

export const WhiteIconWrapper = styled.div`
  ${iconFillWhite}
`;
