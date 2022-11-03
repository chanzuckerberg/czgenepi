import { CellBasic, CellHeader, Checkbox, Table, TableHeader, TableRow } from "czifui";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { map } from "lodash";
import { useEffect, useRef, useState } from "react";
import { getValue } from "@mui/system";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";

// TODO-TR (mlila): types
interface Props {
  data: IdMap<Sample> | undefined;
  isLoading: boolean;
}

const columns = [
  {
    id: 'select',
    header: ({ table }) => {
      const {
        getIsAllRowsSelected,
        getIsSomeRowsSelected,
        getToggleAllRowsSelectedHandler
      } = table;

      const isChecked = getIsAllRowsSelected();
      const isIndeterminate = getIsSomeRowsSelected();
      const checkboxStage = isChecked ? "checked" : (
        isIndeterminate ? "indeterminate" : "unchecked"
      );

      const onChange = getToggleAllRowsSelectedHandler();

      return (
        <Checkbox
          stage={checkboxStage}
          onChange={onChange}
        />
      );
    },
    cell: ({ row }) => {
      const {
        getIsSelected,
        getToggleSelectedHandler,
      } = row;

      const checkboxStage = getIsSelected() ? "checked" : "unchecked";
      const onChange = getToggleSelectedHandler();

      return (
        <Checkbox
          stage={checkboxStage}
          onChange={onChange}
        />
      );
    },
  },
  {
    id: "privateId",
    accessorKey: "privateId",
    header: () => (
      <CellHeader>
        Private ID
      </CellHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
  },
  {
    id: "publicId",
    accessorKey: "publicId",
    header: () => (
      <CellHeader>
        Public ID
      </CellHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
  },
  {
    id: "collectionDate",
    accessorKey: "collectionDate",
    header: () => (
      <CellHeader>
        Collection Date
      </CellHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />,
  },
  {
    id: "lineage",
    accessorKey: "lineage",
    header: () => (
      <CellHeader>
        Lineage
      </CellHeader>
    ),
    cell: ({ getValue }) => {
      const { lineage } = getValue();
      return <CellBasic primaryText={lineage} />;
    },
  },
  {
    id: "uploadDate",
    accessorKey: "uploadDate",
    header: () => (
      <CellHeader>
        Upload Date
      </CellHeader>
    ),
    cell: ({ getValue }) => (
      <CellBasic primaryText={datetimeWithTzToLocalDate(getValue())} />
    )
  },
  {
    id: "collectionLocation",
    accessorKey: "collectionLocation",
    header: () => (
      <CellHeader>
        Collection Location
      </CellHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue().location} />
  },
  {
    id: "sequencingDate",
    accessorKey: "sequencingDate",
    header: () => (
      <CellHeader>
        Sequencing Date
      </CellHeader>
    ),
    cell: ({ getValue }) => <CellBasic primaryText={getValue()} />
  },
  {
    id: "gisaid",
    accessorKey: "gisaid",
    header: () => (
      <CellHeader>
        GISAID
      </CellHeader>
    ),
    cell: ({ getValue }) => {
      const { status } = getValue();
      return <CellBasic primaryText={status} />;
    },
  },
];

const SamplesTable = ({ data, isLoading }: Props): JSX.Element => {
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
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Table>
      <TableHeader>
        {table.getLeafHeaders().map((header) => (
            flexRender(
              header.column.columnDef.header,
              header.getContext()
            )
        ))}
      </TableHeader>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export { SamplesTable };
