import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXs,
  fontHeaderS,
  fontHeaderXs,
  getSpaces,
} from "czifui";
import { ZebraStripes } from "src/common/styles/mixins/global";

const mPadding = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    padding: ${spaces?.m}px;
  `;
};

export const Th = styled.th`
  ${fontHeaderXs}
  ${mPadding}
`;

export const Td = styled.td`
  ${fontBodyXs}
  ${mPadding}
`;

export const Title = styled.span`
  ${fontHeaderS}
`;

export const FullWidthContainer = styled.div`
  width: 100%;
`;

export const CappedHeightScrollableContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  ${(props: CommonThemeProps) => {
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
  tr {
    ${ZebraStripes}
  }
`;
