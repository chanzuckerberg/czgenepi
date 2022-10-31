import { CellBasic, CellHeader, Table, TableHeader, TableRow } from "czifui";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { map } from "lodash";
import { useEffect, useState } from "react";

interface Props {
  data: IdMap<PhyloRun> | undefined;
  isLoading: boolean;
}

const columnHelper = createColumnHelper<PhyloRun>();

const columns = [
  columnHelper.accessor("name", {
    header: "Tree Name",
  }),
  columnHelper.accessor("startedDate", {
    header: "Creation Date",
  }),
  columnHelper.accessor("treeType", {
    header: "Tree Type",
  }),
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
  });

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <>
            {headerGroup.headers.map((header) => (
              <CellHeader key={header.id} horizontalAlign="left">
                {header.isPlaceholder
                  ? ""
                  : (flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    ) as string)}
              </CellHeader>
            ))}
          </>
        ))}
      </TableHeader>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => {
              return (
                <CellBasic
                  horizontalAlign="left"
                  shouldShowTooltipOnHover={false}
                  key={cell.id}
                  primaryText={cell.getValue() as string} // TODO-TR (mlila): type assertion
                ></CellBasic>
              );
            })}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export { TreesTable };
