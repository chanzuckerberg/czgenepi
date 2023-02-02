import { ColumnDef } from "@tanstack/react-table";
import { CellComponent } from "czifui";
import { IdMap } from "src/common/utils/dataTransforms";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import TreeTableNameCell from "../components/TreeTableNameCell";
import { StyledSortableHeader } from "../style";

export const treeName = (
  locations: IdMap<NamedGisaidLocation>
): ColumnDef<PhyloRun, any> => ({
  id: "name",
  accessorKey: "name",
  minSize: 350,
  header: ({ header, column }) => (
    <StyledSortableHeader
      header={header}
      style={generateWidthStyles(column)}
      tooltipStrings={{
        boldText: "Tree Name",
        regularText:
          "User-provided tree name. Auto-generated tree builds are named ”Y Contextual“, where Y is your Group Name.",
      }}
    >
      Tree Name
    </StyledSortableHeader>
  ),
  cell: memo(({ row, cell }) => (
    <CellComponent key={cell.id}>
      <TreeTableNameCell phyloRun={row.original} locations={locations} />
    </CellComponent>
  )),
  enableSorting: true,
  sortingFn: "alphanumeric",
});
