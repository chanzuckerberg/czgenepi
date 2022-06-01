import styled from "@emotion/styled";
import { SmallerThanBreakpoint } from "src/common/styles/mixins/global";

export const UseCasesContainer = styled.div`
  margin: 105px auto;
  width: 100%;
  padding: 0 22px;
  max-width: 1310px;
  position: relative;
`;

export const UseCasesHeader = styled.h2`
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  line-height: 44px;
  letter-spacing: 0.3px;
  position: absolute;
  width: 100%;
  top: 10%;
  z-index: 2;

  @media (max-width: 1200px) {
    font-size: 26px;
    line-height: 34px;
    top: 7%;
  }

  ${SmallerThanBreakpoint(`
    position: relative;
    font-size: 18px;
    line-height: 24px;
    top: -10px;
  `)}
`;

export const UseCasesImage = styled.div`
  width: 100%;
  height: auto;
  z-index: 1;

  ${SmallerThanBreakpoint(`
    display: none;
  `)}
`;

export const UseCasesImageMobile = styled.div`
  display: none;

  ${SmallerThanBreakpoint(`
    display: block;
    width: 100%;
    max-width: 300px;
    height: auto;
    margin: 0 auto;
  `)}
`;
