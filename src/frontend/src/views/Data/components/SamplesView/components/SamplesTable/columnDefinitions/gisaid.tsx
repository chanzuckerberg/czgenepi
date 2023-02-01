import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledCellBasic } from "../style";

export const gisaidColumn: ColumnDef<Sample, any> = {
  id: "gisaid",
  accessorKey: "gisaid",
  header: ({ header, column }) => (
    <SortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "GISAID Status",
        regularText:
          "Whether your sample has been Not Yet Submitted, Submitted, Accepted (with GISAID accession), Rejected, or Not Eligible (marked private).",
      }}
    >
      GISAID
    </SortableHeader>
  ),
  cell: memo(({ getValue, cell }) => {
    const { gisaid_id, status } = getValue();
    return (
      <StyledCellBasic
        key={cell.id}
        primaryText={status}
        secondaryText={gisaid_id}
        shouldShowTooltipOnHover={false}
      />
    );
  }),
  enableSorting: true,
};
