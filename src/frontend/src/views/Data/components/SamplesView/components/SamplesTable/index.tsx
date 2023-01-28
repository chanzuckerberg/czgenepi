import { ColumnDef } from "@tanstack/react-table";
import { CellComponent, Icon } from "czifui";
import { IdMap } from "src/common/utils/dataTransforms";
import { datetimeWithTzToLocalDate } from "src/common/utils/timeUtils";
import { LineageTooltip } from "./components/LineageTooltip";
import DefaultCell from "./components/DefaultCell";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { StyledCellBasic, StyledPrivateId } from "./style";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { getLineageFromSampleLineages } from "src/common/utils/samples";
import { QualityScoreTag } from "./components/QualityScoreTag";
import { memo } from "src/common/utils/memo";
import Table from "src/components/Table";

// (mlila): The group that represents sample uploads or tree
// generations made by CZI
const CZ_BIOHUB_GROUP = "CZI";

// TODO-TR (ehoops): Use config from src/views/Data/tableHeaders/sampleHeadersConfig.tsx
// and move the config if necessary
const columns: ColumnDef<Sample, any>[] = [
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
      const { uploadedBy, private: isPrivate, submittingGroup } = row?.original;
      const uploader =
        submittingGroup?.name === CZ_BIOHUB_GROUP
          ? "CZ Biohub"
          : uploadedBy?.name;

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
          link: {
            href: "https://docs.nextstrain.org/projects/nextclade/en/stable/user/algorithm/07-quality-control.html",
            linkText: "Learn more",
          },
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
            linkText: "Learn more",
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

interface Props {
  data: IdMap<Sample> | undefined;
  isLoading: boolean;
  setCheckedSamples(samples: Sample[]): void;
}

const SamplesTable = ({
  data,
  isLoading,
  setCheckedSamples,
}: Props): JSX.Element => {
  return (
    <Table<Sample>
      columns={columns}
      isLoading={isLoading}
      initialSortKey="uploadDate"
      tableData={data}
      onSetCheckedRows={setCheckedSamples}
      enableMultiRowSelection
    />
  );
};

export { SamplesTable };
