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
import { Table as SDSTable, TableHeader, TableRow } from "czifui";
import { isEqual, map } from "lodash";
import { memo, useEffect, useRef, useState } from "react";
import { useVirtual, VirtualItem } from "react-virtual";
import { IdMap } from "src/common/utils/dataTransforms";
import { StyledWrapper } from "./style";
import { EmptyTable } from "./components/EmptyState";
import { VirtualBumper } from "./components/VirtualBumper";
import { rowSelectionColumn } from "./columnDefinitions/RowSelectionColumn";

interface Props<T> {
  columns: ColumnDef<T, any>[];
  tableData: IdMap<T> | undefined;
  initialSortKey?: string;
  isLoading?: boolean;
  uniqueIdentifier: keyof T;
  // the following three props should either
  // 1) always appear together
  // 2) none appear at all
  // it's hard to programmatically enforce this, so leaving it as a convention for now
  checkedRows?: T[];
  onSetCheckedRows?(rowData: T[]): void;
  enableMultiRowSelection?: boolean;
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
  checkedRows = [],
  onSetCheckedRows,
  uniqueIdentifier,
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - (mlila) this is a fix for a table spacing problem we had
      // https://github.com/TanStack/table/discussions/3192
      size: "auto",
    },
    columns: enableMultiRowSelection
      ? [rowSelectionColumn, ...columns]
      : columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => r[uniqueIdentifier], // use the cz ge object id instead of a default react table id
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: enableMultiRowSelection ? setRowSelection : undefined,
    onSortingChange: setSorting,
    ...props,
  });

  // CHECKED ROW MGMT //
  // this is slightly an anti-pattern, but unfortunately because of the way react table
  // stores state for checked boxes, this way is the most efficient and abstracted
  useEffect(() => {
    if (!onSetCheckedRows) return;

    // for each selected row in the table, map the react-table internal row to the data
    // originally passed into the row
    const newCheckedRows = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);

    onSetCheckedRows(newCheckedRows);
  }, [rowSelection]);

  // pass updates regarding checkedRows from parent view to the table by creating a react-table-readable
  // rowSelectionState (in the form of { rowId: true } for selected rows)
  useEffect(() => {
    const newRowSelection = checkedRows.reduce(
      (obj: Record<string | number, boolean>, row: T) => {
        // not getting row selection as expected? Make sure that your uniqueIdentifier
        // represents a field on your item that returns a unique string or number
        const key = row[uniqueIdentifier] as string | number;
        return {
          ...obj,
          [key]: true,
        };
      },
      {}
    );

    // don't initiate an infinite loop
    if (isEqual(newRowSelection, rowSelection)) return;

    setRowSelection(newRowSelection);
  }, [checkedRows]);
  // END CHECKED ROW MGMT //

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
                <TableRow
                  key={`row-${row.id}`}
                  shouldShowTooltipOnHover={false}
                >
                  {row
                    .getVisibleCells()
                    .map((cell) =>
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                </TableRow>
              );
            })}
          </VirtualBumper>
        </tbody>
      </SDSTable>
    </StyledWrapper>
  );
};

export default memo(Table);
