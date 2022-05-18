import styled from "@emotion/styled";
import { Chip, fontBodyXs, fontBodyXxs, fontHeaderM, getColors, getSpaces } from "czifui";
import { Menu } from "semantic-ui-react";
import { RowContent } from "src/common/components/library/data_table/style";
import { PageContent } from "src/common/styles/mixins/global";

export const Container = styled(PageContent)`
  display: flex;
  flex-flow: column wrap;
  align-content: flex-start;
`;

export const Subtext = styled.div`
  ${fontBodyXxs}
  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.gray[400]};
    `;
  }}
`;

export const UnderlinedCell = styled.div`
  /* Created for UnderlinedRowContent to target */
`;

export const UnderlinedRowContent = styled(RowContent)`
  &:hover {
    ${UnderlinedCell} {
      ${(props) => {
        const colors = getColors(props);

        return `
          border-bottom: 1px dotted ${colors?.gray[500]};
        `;
      }}
    }
  }
`;

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.xs}px;
    `;
  }}
`;

export const GISAIDCell = styled.div`
  flex-direction: column;
  align-items: unset;
`;

export const PrivateIdValueWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SampleIconWrapper = styled.span`
  position: relative;
`;

export const PrivacyIcon = styled.span`
  position: absolute;
  left: 30px;
  bottom: -2px;
`;

export const Navigation = styled.div`
  display: flex;
  width: 100%;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      border-bottom: ${spaces?.xxs}px solid ${colors?.gray[200]};
    `;
  }}
`;

export const CenteredFlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledUploaderName = styled.span`
  ${fontBodyXxs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[500]};
      margin-top: ${spaces?.xxxs}px;
    `;
  }}
`;

export const Category = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
`;

const doNotForwardProps = ["isActive"];

export const CategoryTitle = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${fontHeaderM}

  ${(props) => {
    const { isActive } = props;
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.m}px;
      color: ${colors?.gray[500]};

      ${
        isActive &&
        `
        color: black;
        border-bottom: ${spaces?.xxs}px solid ${colors?.primary[400]};`
      }
    `;
  }}
`;

export const View = styled.div`
  /* (thuang): 74px is the navigation height + margin
  This is needed to ensure the div doesn't disappear
  when the viewport height is too short */
  height: calc(100% - 74px);
  width: calc(100% - 14px);
  display: flex;
`;

export const StyledCount = styled.div`
  ${fontBodyXs}

  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const StyledMenu = styled(Menu)`
  align-items: center;
  margin: 0 !important;

  a div {
    /* overwrite semantic-ui style */
    padding-left: 0 !important;
  }
`;

export const StyledMenuItem = styled(Menu.Item)`
  height: 100%;
`;
