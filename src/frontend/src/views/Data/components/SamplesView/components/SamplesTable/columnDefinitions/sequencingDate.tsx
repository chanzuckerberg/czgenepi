import { ColumnDef } from "@tanstack/react-table";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import DefaultCell from "../components/DefaultCell";

export const sequencingDateColumn: ColumnDef<Sample, any> = {
  id: "sequencingDate",
  accessorKey: "sequencingDate",
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Sequencing Date",
        regularText: "User-provided date on which the sample was sequenced.",
      }}
    >
      Sequencing Date
    </SortableHeader>
  ),
  cell: DefaultCell,
  enableSorting: true,
};
