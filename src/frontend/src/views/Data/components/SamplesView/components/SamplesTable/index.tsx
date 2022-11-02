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

// TODO-TR (mlila): types
interface Props {
  data: IdMap<Sample> | undefined;
  isLoading: boolean;
}

const columnHelper = createColumnHelper<Sample>();

const columns = [
  columnHelper.accessor("privateId", {
    header: "Private ID",
  }),
  columnHelper.accessor("publicId", {
    header: "Public ID",
  }),
  columnHelper.accessor("collectionDate", {
    header: "Collection Date",
  }),
  columnHelper.accessor((obj) => JSON.stringify(obj.lineage), {
    id: "lineage",
    header: "Lineage",
  }),
  columnHelper.accessor("uploadDate", {
    header: "Upload Date",
  }),
  columnHelper.accessor((obj) => JSON.stringify(obj.collectionLocation), {
    id: "collectionLocation",
    header: "Collection Location",
  }),
  columnHelper.accessor("sequencingDate", {
    header: "Sequencing Date",
  }),
  columnHelper.accessor((obj) => JSON.stringify(obj.gisaid), {
    id: "gisaid",
    header: "GISAID",
  }),
];

const SamplesTable = ({ data, isLoading }: Props): JSX.Element => {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    if (!data) return;

    const newSamples = map(data, (v) => v);
    setSamples(newSamples);
  }, [data]);

  const table = useReactTable({
    data: samples,
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

export { SamplesTable };
