import styled from "@emotion/styled";
import { Chip, fontBodyXxs, getColors, getSpacings } from "czifui";
import { RowContent } from "src/common/components/library/data_table/style";
import { pageContentHeight } from "src/common/styles/mixins/global";

export const Container = styled.div`
  ${pageContentHeight}

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

export const LineageCell = styled.div`
  /* Created for LineageRowContent to target */
`;

export const LineageRowContent = styled(RowContent)`
  &:hover {
    ${LineageCell} {
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
    const spacings = getSpacings(props);

    return `
      margin-top: ${spacings?.xxs}px;
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
