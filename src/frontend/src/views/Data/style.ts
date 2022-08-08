import styled from "@emotion/styled";
import {
  Chip,
  CommonThemeProps,
  fontBodyXs,
  fontBodyXxs,
  fontHeaderM,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";
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
  ${fontHeaderXs}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      display: flex;
      align-items: unset;
      margin: ${spaces?.xs}px 0;
      flex-direction: column;
    `;
  }}
`;

export const PrivateIdValueWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SampleIconWrapper = styled.span`
  position: relative;
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.l}px;
    `;
  }}
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

interface Props extends CommonThemeProps {
  isActive?: boolean;
}

const doNotForwardProps = ["isActive"];

export const CategoryTitle = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${fontHeaderM}

  ${(props: Props) => {
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

export const StyledMenu = styled.ul`
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 0;
`;

export const StyledMenuItem = styled.li`
  list-style: none;
  padding: 0;
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }};
`;
