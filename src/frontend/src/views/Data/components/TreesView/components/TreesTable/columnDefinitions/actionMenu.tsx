import { ColumnDef } from "@tanstack/react-table";
import { CellComponent, CellHeader } from "czifui";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { TreeActionMenu } from "../components/TreeActionMenu";

export const actionMenu: ColumnDef<PhyloRun, any> = {
  id: "action",
  size: 160,
  header: ({ column, header }) => (
    <CellHeader
      key={header.id}
      style={generateWidthStyles(column)}
      hideSortIcon
    >
      {" "}
    </CellHeader>
  ),
  cell: memo(({ row, cell }) => (
    <CellComponent key={cell.id}>
      <TreeActionMenu phyloRun={row.original} />
    </CellComponent>
  )),
};
