import { ColumnDef } from "@tanstack/react-table";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledCellBasic } from "../style";

export const uploadDateColumn: ColumnDef<Sample, any> = {
  id: "uploadDate",
  accessorKey: "uploadDate",
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Upload Date",
        regularText: "Date on which the sample was uploaded to CZ Gen Epi.",
      }}
    >
      Upload Date
    </SortableHeader>
  ),
  cell: memo(({ getValue, cell }) => (
    <StyledCellBasic
      key={cell.id}
      shouldTextWrap
      primaryText={datetimeWithTzToLocalDate(getValue())}
      primaryTextWrapLineCount={2}
      shouldShowTooltipOnHover={false}
    />
  )),
};
