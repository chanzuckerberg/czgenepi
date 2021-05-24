import styled from "@emotion/styled";
import { getColors } from "czifui";
import { RowContent } from "src/common/components/library/data_table/style";
import { ReactComponent as ExternalLinkIcon } from "src/common/icons/ExternalLink.svg";
import { icon } from "../../../../common/components/library/data_table/style";

export const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  ${icon}
`;

export const StyledRowContent = styled(RowContent)`
  cursor: pointer;

  :hover {
    ${StyledExternalLinkIcon} {
      ${(props) => {
        const colors = getColors(props);

        return `
          fill: ${colors?.primary[400]};
        `;
      }}
    }
  }

  :active {
    ${StyledExternalLinkIcon} {
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
