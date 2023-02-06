import { ColumnDef } from "@tanstack/react-table";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledCellBasic } from "../style";

export const collectionLocationColumn: ColumnDef<Sample, any> = {
  id: "collectionLocation",
  accessorKey: "collectionLocation",
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Collection Location",
        regularText:
          "User-provided geographic location where the sample was collected (at the county level or above).",
      }}
    >
      Collection Location
    </SortableHeader>
  ),
  cell: memo(({ getValue, cell }) => (
    <StyledCellBasic
      key={cell.id}
      shouldTextWrap
      primaryText={
        getValue().location || getValue().division || getValue().country
      }
      primaryTextWrapLineCount={2}
      shouldShowTooltipOnHover={false}
    />
  )),
  enableSorting: true,
};
