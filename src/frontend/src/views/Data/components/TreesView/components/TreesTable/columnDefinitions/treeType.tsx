import { ColumnDef } from "@tanstack/react-table";
import { memo } from "src/common/utils/memo";
import { generateWidthStyles } from "src/common/utils/tableUtils";
import { StyledCellBasic } from "src/views/Data/components/SamplesView/components/SamplesTable/style";
import { SortableHeader } from "src/views/Data/components/SortableHeader";
import { TreeTypeTooltip } from "../components/TreeTypeTooltip";

export const treeType: ColumnDef<PhyloRun, any> = {
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
};
