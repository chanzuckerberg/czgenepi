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
import React, { useMemo, useRef, useState } from "react";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { TreeActionMenu } from "./components/TreeActionMenu";
import { TreeTypeTooltip } from "./components/TreeTypeTooltip";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import {
  StyledCellBasic,
  StyledTableRow,
} from "../../../SamplesView/components/SamplesTable/style";
import TreeTableNameCell from "./components/TreeTableNameCell";
import { StyledSortableHeader, StyledWrapper } from "./style";
import { generateWidthStyles } from "src/common/utils";
import { NO_CONTENT_FALLBACK } from "src/components/Table/constants";
import { memo } from "src/common/utils/memo";
// TODO-TR: move virtualbumper and update import
import { VirtualBumper } from "../../../SamplesView/components/SamplesTable/components/VirtualBumper";
import { useVirtual, VirtualItem } from "react-virtual";

interface Props {
  data: IdMap<PhyloRun> | undefined;
  isLoading: boolean;
}

const columns: ColumnDef<PhyloRun, any>[] = [
  {
    id: "name",
    accessorKey: "name",
    minSize: 350,
    header: ({ header, column }) => (
      <StyledSortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Tree Name",
          regularText:
            "User-provided tree name. Auto-generated tree builds are named ”Y Contextual“, where Y is your Group Name.",
        }}
      >
        Tree Name
      </StyledSortableHeader>
    ),
    cell: memo(({ row }) => (
      <CellComponent>
        <TreeTableNameCell item={row.original} />
      </CellComponent>
    )),
    enableSorting: true,
    sortingFn: "alphanumeric",
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
    cell: memo(({ getValue }) => (
      <StyledCellBasic
        verticalAlign="center"
        shouldShowTooltipOnHover={false}
        primaryText={datetimeWithTzToLocalDate(getValue())}
      />
    )),
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
    cell: memo(({ getValue }) => {
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
    }),
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
    cell: memo(({ row }) => (
      <CellComponent>
        <TreeActionMenu item={row.original} />
      </CellComponent>
    )),
  },
];

const TreesTable = ({ data, isLoading }: Props): JSX.Element => {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "startedDate",
      desc: true,
    },
  ]);

  const phyloRuns = useMemo(() => {
    if (!data) return [];

    return map(data, (v) => v);
  }, [data]);

  const table = useReactTable({
    data: phyloRuns,
    defaultColumn: {
      cell: ({ getValue }) => (
        <StyledCellBasic
          verticalAlign="center"
          shouldShowTooltipOnHover={false}
          primaryText={(getValue() || NO_CONTENT_FALLBACK) as string}
        />
      ),
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  // TODO-TR (mlila): pull out common structure from samples table
  return (
    <StyledWrapper ref={tableContainerRef}>
      <Table>
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
      </Table>
    </StyledWrapper>
  );
};

export default React.memo(TreesTable);
