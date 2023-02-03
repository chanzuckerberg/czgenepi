import { ColumnDef } from "@tanstack/react-table";
import { memo } from "src/common/utils/memo";
import {
  getLineageFromSample,
  getLineageFromSampleLineages,
} from "src/common/utils/samples";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { LineageTooltip } from "../components/LineageTooltip";
import { StyledCellBasic } from "../style";

export const lineageColumn: ColumnDef<Sample, any> = {
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
  sortingFn: (a, b) => {
    const aLineage = getLineageFromSample(a.original) ?? "";
    const bLineage = getLineageFromSample(b.original) ?? "";
    return aLineage > bLineage ? -1 : 1;
  },
};
