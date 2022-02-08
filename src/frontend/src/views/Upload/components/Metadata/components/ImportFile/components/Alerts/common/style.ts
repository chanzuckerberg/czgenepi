import styled from "@emotion/styled";
import { fontBodyXs, fontHeaderS, fontHeaderXs, getSpaces } from "czifui";
import AlertAccordion from "src/components/AlertAccordion";

export const Th = styled.th`
  ${fontHeaderXs}
`;

export const Td = styled.td`
  ${fontBodyXs}
`;

export const Title = styled.span`
  ${fontHeaderS}
`;

// To get the table to span the entire width of accordion, we must manipulate
// MUI internal CSS to force its div that wraps content to use full width.
// If this gets used regularly, might be better as prop on `AlertAccordion`.
export const FullWidthAlertAccordion = styled(AlertAccordion)`
  .MuiAlert-message {
    width: 100%;
  }
`;

export const FullWidthContainer = styled.div`
  width: 100%;
`;

export const CappedHeightScrollableContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

// `overflow-wrap: anywhere` prevents crazy long sample IDs overflowing table
export const Table = styled.table`
  width: 100%;
  text-align: left;
  border-spacing: 0;
  overflow-wrap: anywhere;
`;

export const TbodyZebra = styled.tbody`
  tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;
