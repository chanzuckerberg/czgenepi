import {
  CellBasic,
  CellHeader,
  Checkbox,
  Table,
  TableHeader,
  TableRow,
} from "czifui";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Header,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { map } from "lodash";
import { ReactNode, useEffect, useState } from "react";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";

// TODO-TR (mlila): types
interface Props {
  data: IdMap<Sample> | undefined;
  isLoading: boolean;
  setCheckedSamples(samples: Sample[]): void;
}

// TODO-TR (mlila): move this header component into its own file
interface SortableProps {
  header: Header<any, any>;
  children: ReactNode & string;
}

export const SortableHeader = ({ header, children }: SortableProps) => {
  const { getCanSort, getIsSorted, getToggleSortingHandler } = header.column;

  const sortable = getCanSort();
  const sortDirection = getIsSorted() || undefined;
  const handler = getToggleSortingHandler();

  return (
    <CellHeader
      onClick={handler}
      direction={sortDirection}
      active={Boolean(sortDirection)}
      hideSortIcon={!sortable}
    >
      {children}
    </CellHeader>
  );
};

const columns: ColumnDef<Sample, any>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const {
        getIsAllRowsSelected,
        getIsSomeRowsSelected,
        getToggleAllRowsSelectedHandler,
      } = table;

      const isChecked = getIsAllRowsSelected();
      const isIndeterminate = getIsSomeRowsSelected();
      const checkboxStage = isChecked
        ? "checked"
        : isIndeterminate
        ? "indeterminate"
        : "unchecked";

      const onChange = getToggleAllRowsSelectedHandler();

      return <Checkbox stage={checkboxStage} onChange={onChange} />;
    },
    cell: ({ row }) => {
      const { getIsSelected, getToggleSelectedHandler } = row;

      const checkboxStage = getIsSelected() ? "checked" : "unchecked";
      const onChange = getToggleSelectedHandler();

      return <Checkbox stage={checkboxStage} onChange={onChange} />;
    },
  },
  {
    id: "privateId",
    accessorKey: "privateId",
    header: ({ header }) => (
      <SortableHeader header={header}>Private ID</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
  {
    id: "publicId",
    accessorKey: "publicId",
    header: ({ header }) => (
      <SortableHeader header={header}>Public ID</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
  {
    id: "collectionDate",
    accessorKey: "collectionDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Collection Date</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
  {
    id: "lineage",
    accessorKey: "lineage",
    header: ({ header }) => (
      <SortableHeader header={header}>Lineage</SortableHeader>
    ),
    cell: ({ getValue }) => {
      const { lineage } = getValue();
      return <CellBasic primaryText={lineage} />;
    },
    enableSorting: true,
  },
  {
    id: "uploadDate",
    accessorKey: "uploadDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Upload Date</SortableHeader>
    ),
    cell: ({ getValue }) => (
      <CellBasic primaryText={datetimeWithTzToLocalDate(getValue())} />
    ),
    enableSorting: true,
  },
  {
    id: "collectionLocation",
    accessorKey: "collectionLocation",
    header: ({ header }) => (
      <SortableHeader header={header}>Collection Location</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue().location} />,
    enableSorting: true,
  },
  {
    id: "sequencingDate",
    accessorKey: "sequencingDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Sequencing Date</SortableHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
    enableSorting: true,
  },
  {
    id: "gisaid",
    accessorKey: "gisaid",
    header: ({ header }) => (
      <SortableHeader header={header}>GISAID</SortableHeader>
    ),
    cell: ({ getValue }) => {
      const { status } = getValue();
      return <CellBasic primaryText={status} />;
    },
    enableSorting: true,
  },
];

const SamplesTable = ({
  data,
  isLoading,
  setCheckedSamples,
}: Props): JSX.Element => {
  const [samples, setSamples] = useState<Sample[]>([]);
  // TODO-TR (mlila): type?
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    if (!data) return;

    const newSamples = map(data, (v) => v);
    setSamples(newSamples);
  }, [data]);

  const table = useReactTable({
    data: samples,
    columns,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

  useEffect(() => {
    // for each selected row in the table, map the react-table internal row to the data (Sample)
    // originally passed into the row
    const newCheckedSamples = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);

    setCheckedSamples(newCheckedSamples);
  }, [rowSelection]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

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

export { SamplesTable };
