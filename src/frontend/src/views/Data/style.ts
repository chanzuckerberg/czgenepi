import styled from "@emotion/styled";
import { Chip, fontBodyXxs, getColors, getSpaces } from "czifui";
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

export const FlexContainer = styled.div`
  display: flex;
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
