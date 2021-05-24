import styled from "@emotion/styled";
import { getColors } from "czifui";
import { RowContent } from "src/common/components/library/data_table/style";
import OpenInNewIcon from "src/common/icons/OpenInNew.svg";
import { icon } from "../../../../common/components/library/data_table/style";

export const StyledOpenInNewIcon = styled(OpenInNewIcon)`
  ${icon}
`;

export const StyledRowContent = styled(RowContent)`
  cursor: pointer;

  :hover {
    ${StyledOpenInNewIcon} {
      ${(props) => {
        const colors = getColors(props);

        return `
          fill: ${colors?.primary[400]};
        `;
      }}
    }
  }

  :active {
    ${StyledOpenInNewIcon} {
      ${(props) => {
        const colors = getColors(props);

        return `
          fill: ${colors?.primary[600]};
        `;
      }}
    }
  }
`;

export const CellWrapper = styled.div`
  display: flex;
  align-items: center;
`;
