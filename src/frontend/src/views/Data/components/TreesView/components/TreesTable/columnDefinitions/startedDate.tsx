import { ColumnDef } from "@tanstack/react-table";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledCellBasic } from "../style";

export const startedDate: ColumnDef<PhyloRun, any> = {
  id: "startedDate",
  accessorKey: "startedDate",
  size: 160,
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Creation Date",
        regularText: "Date on which the tree was generated.",
      }}
    >
      Creation Date
    </SortableHeader>
  ),
  cell: memo(({ getValue, cell }) => (
    <StyledCellBasic
      key={cell.id}
      verticalAlign="center"
      shouldShowTooltipOnHover={false}
      primaryText={datetimeWithTzToLocalDate(getValue())}
    />
  )),
  enableSorting: true,
};
