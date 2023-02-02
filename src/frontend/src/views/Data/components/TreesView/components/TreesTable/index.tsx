import { CellComponent, CellHeader } from "czifui";
import { ColumnDef } from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { TreeActionMenu } from "./components/TreeActionMenu";
import { TreeTypeTooltip } from "./components/TreeTypeTooltip";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledCellBasic } from "../../../SamplesView/components/SamplesTable/style";
import TreeTableNameCell from "./components/TreeTableNameCell";
import { StyledSortableHeader } from "./style";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { NO_CONTENT_FALLBACK } from "src/components/Table/constants";
import { memo } from "src/common/utils/memo";
import Table from "src/components/Table";

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
    cell: memo(({ row, cell }) => (
      <CellComponent key={cell.id}>
        <TreeTableNameCell phyloRun={row.original} />
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
    cell: memo(({ getValue, cell }) => (
      <StyledCellBasic
        key={cell.id}
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
    cell: memo(({ getValue, cell }) => {
      const type = getValue();
      return (
        <TreeTypeTooltip value={type}>
          <StyledCellBasic
            key={cell.id}
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
    header: ({ column, header }) => (
      <CellHeader
        key={header.id}
        style={generateWidthStyles(column)}
        hideSortIcon
      >
        {" "}
      </CellHeader>
    ),
    cell: memo(({ row, cell }) => (
      <CellComponent key={cell.id}>
        <TreeActionMenu phyloRun={row.original} />
      </CellComponent>
    )),
  },
];

const defaultColumn: Partial<ColumnDef<PhyloRun, any>> = {
  cell: memo(({ getValue }) => (
    <StyledCellBasic
      verticalAlign="center"
      shouldShowTooltipOnHover={false}
      primaryText={(getValue() || NO_CONTENT_FALLBACK) as string}
    />
  )),
};

const TreesTable = ({ data, isLoading }: Props): JSX.Element => {
  console.log("TreesTable");
  return (
    <Table<PhyloRun>
      columns={columns}
      tableData={data}
      isLoading={isLoading}
      initialSortKey="startedDate"
      defaultColumn={defaultColumn}
      uniqueIdentifier="workflowId"
    />
  );
};

export { TreesTable };
