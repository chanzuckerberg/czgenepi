import styled from "@emotion/styled";

export const NextstrainLogo = styled.div`
  max-width: 196px;
`;

export const PangolinLogo = styled.div`
  max-width: 171px;
`;

export const PartnerLink = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 242px;
  height: 118px;
  border: 1px solid #d3d3d3;
  outline: 5px solid transparent;
  cursor: pointer;

  &:nth-of-type(2) {
    margin: 0 45px;

    @media (max-width: 768px) {
      margin: 45px 0;
    }
  }

  &:hover {
    border: 2px solid #535353;
  }
`;

export const PartnersSectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 67px 22px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const UsherLogo = styled.div`
  max-width: 107px;
`;
