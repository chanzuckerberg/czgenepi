import styled from "@emotion/styled";
import { CommonThemeProps, getColors } from "czifui";
import { SmallerThanBreakpoint } from "src/common/styles/mixins/global";

const centeredFlex = () => {
  return `
    display: flex;
    align-items: center;
    justify-content: center;
  `;
};

export const GisaidLogo = styled.div`
  ${centeredFlex}
  max-width: 140px;
`;

export const NextstrainLogo = styled.div`
  ${centeredFlex}
  max-width: 196px;
`;

export const PangolinLogo = styled.div`
  ${centeredFlex}
  max-width: 171px;
`;

export const PartnerLink = styled.a`
  ${centeredFlex}
  width: 100%;
  max-width: 242px;
  height: 118px;
  cursor: pointer;

  &:nth-of-type(2) {
    margin-left: 45px;

    ${SmallerThanBreakpoint(`
      margin: 45px 0;
    `)}
  }

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      border: 1px solid ${colors?.gray[300]};

      &:hover {
        border: 2px solid ${colors?.gray[600]};
      }
    `;
  }}
`;

export const PartnerLinkRow = styled.div`
  ${centeredFlex}
  margin-bottom: 45px;
  width: 100%;

  ${SmallerThanBreakpoint(`
    flex-direction: column;
    margin-bottom: 0;
  `)}
`;

export const PartnersSectionContainer = styled.div`
  padding: 67px 0;
`;

export const UsherLogo = styled.div`
  ${centeredFlex}
  max-width: 107px;
`;
