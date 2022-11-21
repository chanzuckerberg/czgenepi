import { CellComponent, CellHeader, Table, TableHeader } from "czifui";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { map } from "lodash";
import { useEffect, useState } from "react";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { TreeActionMenu } from "./components/TreeActionMenu";
import { TreeTypeTooltip } from "./components/TreeTypeTooltip";
// TODO-TR (mlila): move the below imports to a generic location
import { SortableHeader } from "../../../SamplesView/components/SamplesTable/components/SortableHeader";
import { generateWidthStyles } from "../../../SamplesView/components/SamplesTable";
import {
  StyledCellBasic,
  StyledTableRow,
} from "../../../SamplesView/components/SamplesTable/style";
import TreeTableNameCell from "./components/TreeTableNameCell";
import { StyledSortableHeader } from "./style";

interface Props {
  data: IdMap<PhyloRun> | undefined;
  isLoading: boolean;
}

// TODO-TR (mlila): set fallback cell values when, eg, tree name not defined

// TODO-TR (mlila): create a default cell & col def
const columns: ColumnDef<PhyloRun, any>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ header }) => (
      <StyledSortableHeader
        header={header}
        tooltipStrings={{
          boldText: "Tree Name",
          regularText:
            "User-provided tree name. Auto-generated tree builds are named ”Y Contextual“, where Y is your Group Name.",
        }}
      >
        Tree Name
      </StyledSortableHeader>
    ),
    cell: ({ row }) => (
      <CellComponent>
        <TreeTableNameCell item={row.original} />
      </CellComponent>
    ),
    enableSorting: true,
  },
  {
    id: "startedDate",
    accessorKey: "startedDate",
    size: 160,
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Creation Date",
          regularText: "Date on which the tree was generated.",
        }}
      >
        Creation Date
      </SortableHeader>
    ),
    cell: ({ getValue }) => (
      <StyledCellBasic
        verticalAlign="center"
        shouldShowTooltipOnHover={false}
        primaryText={datetimeWithTzToLocalDate(getValue())}
      />
    ),
    enableSorting: true,
  },
  {
    id: "treeType",
    accessorKey: "treeType",
    size: 160,
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Tree Type",
          link: {
            href: "https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing",
            linkText: "Read our guide to learn more.",
          },
          regularText:
            "CZ Gen Epi-defined profiles for tree building based on primary use case and build settings.",
        }}
      >
        Tree Type
      </SortableHeader>
    ),
    cell: ({ getValue }) => {
      const type = getValue();
      return (
        <TreeTypeTooltip value={type}>
          <StyledCellBasic
            verticalAlign="center"
            shouldShowTooltipOnHover={false}
            primaryText={getValue()}
          />
        </TreeTypeTooltip>
      );
    },
    enableSorting: true,
  },
  {
    id: "action",
    size: 160,
    header: ({ column }) => (
      <CellHeader style={generateWidthStyles(column)} hideSortIcon>
        {" "}
      </CellHeader>
    ),
    cell: ({ row }) => (
      <CellComponent>
        <TreeActionMenu item={row.original} />
      </CellComponent>
    ),
  },
];

const TreesTable = ({ data, isLoading }: Props): JSX.Element => {
  const [phyloRuns, setPhyloRuns] = useState<PhyloRun[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "startedDate",
      desc: true,
    },
  ]);

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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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
          <StyledTableRow key={row.id}>
            {row
              .getVisibleCells()
              .map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
          </StyledTableRow>
        ))}
      </tbody>
    </Table>
  );
};

export { TreesTable };
