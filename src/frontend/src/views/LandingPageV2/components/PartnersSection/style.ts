import styled from "@emotion/styled";
import { CommonThemeProps, getColors } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { SmallerThanBreakpoint } from "src/common/styles/mixins/global";

const centeredFlex = () => {
  return `
    display: flex;
    align-items: center;
    justify-content: center;
  `;
};

// Each logo link has its own styled component because the images
// are slightly different sizes. This makes them all appear the
// same size.
export const NextstrainLogoLink = styled(NewTabLink)`
  ${centeredFlex}
  max-width: 196px;
`;

export const PangolinLogoLink = styled(NewTabLink)`
  ${centeredFlex}
  max-width: 171px;
`;

export const UsherLogoLink = styled(NewTabLink)`
  ${centeredFlex}
  max-width: 107px;
`;

export const NextcladeLogoLink = styled(NewTabLink)`
  ${centeredFlex}
  max-width: 182px;
`;

export const NcbiVirusLogoLink = styled(NewTabLink)`
  ${centeredFlex}
  max-width: 196px;
`;

export const LogoItem = styled.li`
  list-style: none;
  ${centeredFlex}
  width: 100%;
  max-width: 242px;
  height: 118px;
  cursor: pointer;
  margin: 22px;

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

export const LogoLink = styled(NewTabLink)`
  ${centeredFlex}
  max-width: 196px;
`;

export const PartnerLinkRow = styled.ul`
  ${centeredFlex}
  width: 100%;
  max-width: 870px;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
`;

export const PartnersSectionContainer = styled.div`
  padding: 55px 0;
  align-self: center;
  ${SmallerThanBreakpoint(`
    flex-direction: column;
    padding: 0;
  `)}
`;
