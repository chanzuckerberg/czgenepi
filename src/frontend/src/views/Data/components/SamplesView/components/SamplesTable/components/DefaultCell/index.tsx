import { Cell, Getter } from "@tanstack/react-table";
import { NO_CONTENT_FALLBACK } from "src/components/Table/constants";
import { StyledCellBasic } from "../../style";

// * This file should not be changed unless you intend the change the basic default behavior
// * for all cells in the table. If you need a cell to do something other than this, consider
// * adding a custom display cell (ie: new component definition) for your column.

interface DefaultCellProps {
  cell: Cell;
  getValue: Getter<any>;
}

export const DefaultCell = ({
  cell,
  getValue,
}: DefaultCellProps): JSX.Element => (
  <StyledCellBasic
    key={cell.id}
    shouldTextWrap
    primaryText={getValue() || NO_CONTENT_FALLBACK}
    primaryTextWrapLineCount={2}
    shouldShowTooltipOnHover={false}
  />
);
