import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { Table as SDSTable, TableHeader } from "czifui";
import { map } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useVirtual, VirtualItem } from "react-virtual";
import { IdMap } from "src/common/utils/dataTransforms";
import { StyledTableRow, StyledWrapper } from "./style";
import { EmptyTable } from "./components/EmptyState";
import { VirtualBumper } from "./components/VirtualBumper";
import { rowSelectionColumn } from "./columnDefinitions/RowSelectionColumn";

interface Props<T> {
  columns: ColumnDef<T, any>[];
  tableData: IdMap<T> | undefined;
  initialSortKey?: string;
  isLoading?: boolean;
  onSetCheckedRows?(rowData: T[]): void;
}

/**
 * Generic virtualized table for use throughout the app.
 * Uses a sensible set of defaults, all of which can be overwritten.
 * Any additional props passed into this component will be passed
 * through to the table initialization function, so you can wield the
 * full power and potential of React Table v8!
 * https://tanstack.com/table/v8/docs/api/core/table
 */
const Table = <T extends any>({
  columns,
  tableData,
  initialSortKey,
  isLoading,
  onSetCheckedRows,
  ...props
}: Props<T> & Partial<TableOptions<any>>): JSX.Element => {
  const { enableMultiRowSelection } = props;

  const [data, setData] = useState<T[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // initialize sort state value; only run once
  useEffect(() => {
    setSorting([
      {
        id: initialSortKey ?? "",
        desc: true,
      },
    ]);
  }, []);

  // map data to the correct format to pass to react table
  useEffect(() => {
    if (!tableData) return;

    const newData = map(tableData, (v) => v);
    setData(newData);
  }, [tableData]);

  // initialize the table
  const table = useReactTable({
    data,
    defaultColumn: {
      minSize: 50,
      size: 50,
    },
    columns: enableMultiRowSelection
      ? [rowSelectionColumn, ...columns]
      : columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: enableMultiRowSelection ? setRowSelection : undefined,
    onSortingChange: setSorting,
    ...props,
  });

  // adds virtualization to the table
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    // increasing the `overscan` number will enable smoother scrolling, but will also add more nodes
    // to the DOM, and may impact performance of other things in view, such as filters and modals
    overscan: 25,
  });
  const { virtualItems: virtualRows, totalSize } = rowVirtualizer;
  // end virtualization code

  useEffect(() => {
    if (!onSetCheckedRows) return;

    // for each selected row in the table, map the react-table internal row to the data
    // originally passed into the row
    const newCheckedRows = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);

    onSetCheckedRows(newCheckedRows);
  }, [rowSelection]);

  if (isLoading) {
    return <EmptyTable numOfColumns={columns.length} />;
  }

  return (
    <StyledWrapper ref={tableContainerRef}>
      <SDSTable>
        <TableHeader>
          {table
            .getLeafHeaders()
            .map((header) =>
              flexRender(header.column.columnDef.header, header.getContext())
            )}
        </TableHeader>
        <tbody>
          <VirtualBumper totalSize={totalSize} virtualRows={virtualRows}>
            {virtualRows.map((vRow: VirtualItem) => {
              const row = rows[vRow.index];
              return (
                <StyledTableRow key={row.id} shouldShowTooltipOnHover={false}>
                  {row
                    .getVisibleCells()
                    .map((cell) =>
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                </StyledTableRow>
              );
            })}
          </VirtualBumper>
        </tbody>
      </SDSTable>
    </StyledWrapper>
  );
};

export default Table;
