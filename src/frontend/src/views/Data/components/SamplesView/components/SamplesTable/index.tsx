import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  CellComponent,
  CellHeader,
  Icon,
  InputCheckbox,
  Table,
  TableHeader,
} from "czifui";
import { map } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useVirtual } from "react-virtual";
import { IdMap } from "src/common/utils/dataTransforms";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { LineageTooltip } from "./components/LineageTooltip";
import { DefaultCell } from "./components/DefaultCell";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import {
  StyledCellBasic,
  StyledInputCheckbox,
  StyledPrivateId,
  StyledTableRow,
  StyledWrapper,
} from "./style";
import { EmptyTable } from "src/views/Data/components/EmptyState";
import { generateWidthStyles } from "src/common/utils";
import { getLineageFromSampleLineages } from "src/common/utils/samples";
import { QualityScoreTag } from "./components/QualityScoreTag";
import { memo } from "src/common/utils/memo";
import { VirtualBumper } from "./components/VirtualBumper";

interface Props {
  data: IdMap<Sample> | undefined;
  isLoading: boolean;
  setCheckedSamples(samples: Sample[]): void;
}

// TODO-TR (ehoops): Use config from src/views/Data/table-headers/sampleHeadersConfig.tsx
// and move the config if necessary
const columns: ColumnDef<Sample, any>[] = [
  {
    id: "select",
    size: 40,
    minSize: 40,
    header: ({ table, column, header }) => {
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
        <CellHeader
          key={header.id}
          hideSortIcon
          style={generateWidthStyles(column)}
        >
          <StyledInputCheckbox stage={checkboxStage} onChange={onChange} />
        </CellHeader>
      );
    },
    cell: ({ row, cell }) => {
      const { getIsSelected, getToggleSelectedHandler } = row;

      const checkboxStage = getIsSelected() ? "checked" : "unchecked";
      const onChange = getToggleSelectedHandler();

      return (
        <CellComponent key={cell.id}>
          <InputCheckbox stage={checkboxStage} onChange={onChange} />
        </CellComponent>
      );
    },
  },
  {
    id: "privateId",
    accessorKey: "privateId",
    size: 250,
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Private ID",
          regularText:
            "User-provided private ID. Only users in your Group can see it.",
        }}
      >
        Private ID
      </SortableHeader>
    ),
    cell: memo(({ getValue, row, cell }) => {
      const { uploadedBy, private: isPrivate } = row?.original;
      const uploader = uploadedBy?.name;

      return (
        <StyledPrivateId
          key={cell.id}
          primaryText={getValue()}
          secondaryText={uploader}
          shouldTextWrap
          primaryTextWrapLineCount={1}
          icon={
            <Icon
              sdsIcon={isPrivate ? "flaskPrivate" : "flaskPublic"}
              sdsSize="xl"
              sdsType="static"
            />
          }
          tooltipProps={{
            sdsStyle: "light",
            arrow: false,
          }}
        />
      );
    }),
    enableSorting: true,
  },
  {
    id: "publicId",
    accessorKey: "publicId",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Public ID",
          regularText:
            "This is your GISAID ID or public ID generated by CZ Gen Epi.",
        }}
      >
        Public ID
      </SortableHeader>
    ),
    cell: DefaultCell,
    enableSorting: true,
  },
  {
    id: "qualityControl",
    accessorKey: "qcMetrics",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Quality Score",
          regularText:
            "Overall QC score from Nextclade which considers genome completion and screens for potential contamination and sequencing or bioinformatics errors.",
        }}
      >
        Quality Score
      </SortableHeader>
    ),
    cell: memo(({ getValue, cell }) => {
      const qcMetric = getValue()?.[0];
      return (
        <CellComponent key={cell.id}>
          <QualityScoreTag qcMetric={qcMetric} />
        </CellComponent>
      );
    }),
    sortingFn: (a, b) => {
      const statusA = a.original.qcMetrics[0].qc_status;
      const statusB = b.original.qcMetrics[0].qc_status;
      return statusA > statusB ? -1 : 1;
    },
  },
  {
    id: "uploadDate",
    accessorKey: "uploadDate",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Upload Date",
          regularText: "Date on which the sample was uploaded to CZ Gen Epi.",
        }}
      >
        Upload Date
      </SortableHeader>
    ),
    cell: memo(({ getValue, cell }) => (
      <StyledCellBasic
        key={cell.id}
        shouldTextWrap
        primaryText={datetimeWithTzToLocalDate(getValue())}
        primaryTextWrapLineCount={2}
        shouldShowTooltipOnHover={false}
      />
    )),
  },
  {
    id: "collectionDate",
    accessorKey: "collectionDate",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Collection Date",
          regularText:
            "User-provided date on which the sample was collected from an individual or an environment.",
        }}
      >
        Collection Date
      </SortableHeader>
    ),
    cell: DefaultCell,
    enableSorting: true,
  },
  {
    id: "lineage",
    accessorKey: "lineages",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Lineage",
          link: {
            href: "https://cov-lineages.org/pangolin.html",
            linkText: "Learn more.",
          },
          regularText:
            "A lineage is a named group of related sequences. A few lineages have been associated with changes in the epidemiological or biological characteristics of the virus. We continually update these lineages based on the evolving Pangolin designations. Lineages determined by Pangolin.",
        }}
      >
        Lineage
      </SortableHeader>
    ),
    cell: memo(({ getValue, cell }) => {
      const lineages = getValue();
      const lineage = getLineageFromSampleLineages(lineages);
      const CellContent = (
        <StyledCellBasic
          key={cell.id}
          shouldTextWrap
          primaryText={lineage?.lineage ?? "Not Yet Processed"}
          primaryTextWrapLineCount={2}
          shouldShowTooltipOnHover={false}
        />
      );

      return lineage ? (
        <LineageTooltip lineage={lineage}>{CellContent}</LineageTooltip>
      ) : (
        CellContent
      );
    }),
    enableSorting: true,
  },
  {
    id: "collectionLocation",
    accessorKey: "collectionLocation",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Collection Location",
          regularText:
            "User-provided geographic location where the sample was collected (at the county level or above).",
        }}
      >
        Collection Location
      </SortableHeader>
    ),
    cell: memo(({ getValue, cell }) => (
      <StyledCellBasic
        key={cell.id}
        shouldTextWrap
        primaryText={
          getValue().location || getValue().division || getValue().country
        }
        primaryTextWrapLineCount={2}
        shouldShowTooltipOnHover={false}
      />
    )),
    enableSorting: true,
  },
  {
    id: "sequencingDate",
    accessorKey: "sequencingDate",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "Sequencing Date",
          regularText: "User-provided date on which the sample was sequenced.",
        }}
      >
        Sequencing Date
      </SortableHeader>
    ),
    cell: DefaultCell,
    enableSorting: true,
  },
  {
    // TODO-TR (mlila): check the secondary text displays properly
    id: "gisaid",
    accessorKey: "gisaid",
    header: ({ header, column }) => (
      <SortableHeader
        header={header}
        style={generateWidthStyles(column)}
        tooltipStrings={{
          boldText: "GISAID Status",
          regularText:
            "Whether your sample has been Not Yet Submitted, Submitted, Accepted (with GISAID accession), Rejected, or Not Eligible (marked private).",
        }}
      >
        GISAID
      </SortableHeader>
    ),
    cell: memo(({ getValue, cell }) => {
      const { gisaid_id, status } = getValue();
      return (
        <StyledCellBasic
          key={cell.id}
          primaryText={status}
          secondaryText={gisaid_id}
          shouldShowTooltipOnHover={false}
        />
      );
    }),
    enableSorting: true,
  },
];

const SamplesTable = ({
  data,
  isLoading,
  setCheckedSamples,
}: Props): JSX.Element => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "uploadDate",
      desc: true,
    },
  ]);

  useEffect(() => {
    if (!data) return;

    const newSamples = map(data, (v) => v);
    setSamples(newSamples);
  }, [data]);

  const table = useReactTable({
    data: samples,
    defaultColumn: {
      minSize: 50,
      size: 50,
    },
    columns,
    enableMultiRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
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

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;
  // end virtualization code

  useEffect(() => {
    // for each selected row in the table, map the react-table internal row to the data (Sample)
    // originally passed into the row
    const newCheckedSamples = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);

    setCheckedSamples(newCheckedSamples);
  }, [rowSelection]);

  if (isLoading) {
    return <EmptyTable numOfColumns={columns.length} />;
  }

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
          <VirtualBumper padding={paddingTop} />
          {virtualRows.map((vRow) => {
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
          <VirtualBumper padding={paddingBottom} />
        </tbody>
      </Table>
    </StyledWrapper>
  );
};

export default memo(SamplesTable);
