import { ColumnDef } from "@tanstack/react-table";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import DefaultCell from "../components/DefaultCell";

export const collectionDateColumn: ColumnDef<Sample, any> = {
  id: "collectionDate",
  accessorKey: "collectionDate",
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Collection Date",
        regularText:
          "User-provided date on which the sample was collected from an individual or an environment.",
      }}
    >
      Collection Date
    </SortableHeader>
  ),
  cell: DefaultCell,
  enableSorting: true,
};
