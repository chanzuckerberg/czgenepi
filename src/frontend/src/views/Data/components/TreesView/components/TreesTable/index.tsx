import { CellBasic, Table, TableHeader, TableRow } from "czifui";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { map } from "lodash";
import { useEffect, useState } from "react";

interface Props {
  data: IdMap<PhyloRun> | undefined;
  isLoading: boolean;
}

// TODO-TR (mlila): create a default cell & col def
const columns: ColumnDef<PhyloRun, any>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ header }) => (
      <SortableHeader header={header}>Tree Name</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
  {
    id: "startedDate",
    accessorKey: "startedDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Creation Date</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
  {
    id: "treeType",
    accessorKey: "treeType",
    header: ({ header }) => (
      <SortableHeader header={header}>Tree Type</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
];

const TreesTable = ({ data, isLoading }: Props): JSX.Element => {
  const [phyloRuns, setPhyloRuns] = useState<PhyloRun[]>([]);

  useEffect(() => {
    if (!data) return;

    const newRuns = map(data, (v) => v);
    setPhyloRuns(newRuns);
  }, [data]);

  const table = useReactTable({
    data: phyloRuns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  // TODO-TR (mlila): pull out common structure from samples table
  return (
    <Table>
      <TableHeader>
        {table
          .getLeafHeaders()
          .map((header) =>
            flexRender(header.column.columnDef.header, header.getContext())
          )}
      </TableHeader>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row
              .getVisibleCells()
              .map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export { TreesTable };
