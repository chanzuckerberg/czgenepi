import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Getter,
  Header,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import {
  CellComponent,
  CellHeader,
  Icon,
  InputCheckbox,
  Table,
  TableHeader,
  TableRow,
} from "czifui";
import { map } from "lodash";
import { ReactNode, useEffect, useState } from "react";
import { IdMap } from "src/common/utils/dataTransforms";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { StyledCellBasic, StyledPrivateId } from "./style";

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

export const SortableHeader = ({
  header,
  children,
}: SortableProps): JSX.Element => {
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

// TODO-TR (mlila): move this default cell into its own component file
const DefaultCell = ({ getValue }: { getValue: Getter<any> }): JSX.Element => (
  <StyledCellBasic
    shouldTextWrap
    primaryText={getValue()}
    primaryTextWrapLineCount={2}
    shouldShowTooltipOnHover={false}
  />
);

const columns: ColumnDef<Sample, any>[] = [
  {
    id: "select",
    size: 50,
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

      return (
        <CellComponent>
          <InputCheckbox stage={checkboxStage} onChange={onChange} />
        </CellComponent>
      );
    },
    cell: ({ row }) => {
      const { getIsSelected, getToggleSelectedHandler } = row;

      const checkboxStage = getIsSelected() ? "checked" : "unchecked";
      const onChange = getToggleSelectedHandler();

      return (
        <CellComponent>
          <InputCheckbox stage={checkboxStage} onChange={onChange} />
        </CellComponent>
      );
    },
  },
  {
    id: "privateId",
    accessorKey: "privateId",
    minSize: 350,
    header: ({ header }) => (
      <SortableHeader header={header}>Private ID</SortableHeader>
    ),
    cell: ({ getValue, row }) => {
      const uploader = row?.original?.uploadedBy.name;
      return (
        <StyledPrivateId
          primaryText={getValue()}
          secondaryText={uploader}
          shouldTextWrap
          primaryTextWrapLineCount={1}
          icon={<Icon sdsIcon="flaskPublic" sdsSize="xl" sdsType="static" />}
          tooltipProps={{
            sdsStyle: "light",
            arrow: false,
          }}
        />
      );
    },
    enableSorting: true,
  },
  {
    id: "publicId",
    accessorKey: "publicId",
    header: ({ header }) => (
      <SortableHeader header={header}>Public ID</SortableHeader>
    ),
    cell: DefaultCell,
    enableSorting: true,
  },
  {
    id: "uploadDate",
    accessorKey: "uploadDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Upload Date</SortableHeader>
    ),
    cell: ({ getValue }) => (
      <StyledCellBasic
        shouldTextWrap
        primaryText={datetimeWithTzToLocalDate(getValue())}
        primaryTextWrapLineCount={2}
        shouldShowTooltipOnHover={false}
      />
    ),
  },
  {
    id: "collectionDate",
    accessorKey: "collectionDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Collection Date</SortableHeader>
    ),
    cell: DefaultCell,
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
      return (
        <StyledCellBasic
          shouldTextWrap
          primaryText={lineage}
          primaryTextWrapLineCount={2}
          shouldShowTooltipOnHover={false}
        />
      );
    },
    enableSorting: true,
  },
  {
    id: "collectionLocation",
    accessorKey: "collectionLocation",
    header: ({ header }) => (
      <SortableHeader header={header}>Collection Location</SortableHeader>
    ),
    cell: ({ getValue }) => (
      <StyledCellBasic
        shouldTextWrap
        primaryText={getValue().location}
        primaryTextWrapLineCount={2}
        shouldShowTooltipOnHover={false}
      />
    ),
    enableSorting: true,
  },
  {
    id: "sequencingDate",
    accessorKey: "sequencingDate",
    header: ({ header }) => (
      <SortableHeader header={header}>Sequencing Date</SortableHeader>
    ),
    cell: DefaultCell,
  },
  {
    id: "gisaid",
    accessorKey: "gisaid",
    header: ({ header }) => (
      <SortableHeader header={header}>GISAID</SortableHeader>
    ),
    cell: ({ getValue }) => {
      const { gisaid_id, status } = getValue();
      return (
        <StyledCellBasic
          primaryText={status}
          secondaryText={gisaid_id}
          shouldShowTooltipOnHover={false}
        />
      );
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
    defaultColumn: {
      minSize: 50,
    },
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
