import { Getter } from "@tanstack/react-table";
import { StyledCellBasic } from "../../style";

// * This file should not be changed unless you intend the change the basic default behavior
// * for all cells in the table. If you need a cell to do something other than this, consider
// * adding a custom display cell (ie: new component definition) for your column.

interface DefaultCellProps {
  getValue: Getter<any>;
}

export const DefaultCell = ({ getValue }: DefaultCellProps): JSX.Element => (
  <StyledCellBasic
    shouldTextWrap
    primaryText={getValue()}
    primaryTextWrapLineCount={2}
    shouldShowTooltipOnHover={false}
  />
);
