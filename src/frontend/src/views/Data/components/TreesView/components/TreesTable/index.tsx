import { ColumnDef } from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
import { StyledCellBasic } from "../../../SamplesView/components/SamplesTable/style";
import { NO_CONTENT_FALLBACK } from "src/components/Table/constants";
import { memo } from "src/common/utils/memo";
import Table from "src/components/Table";
import { useLocations } from "src/common/queries/locations";
import { useMemo } from "react";
import { getNamedLocationsById } from "src/common/utils/locationUtils";
import { treeName } from "./columnDefinitions/treeName";
import { startedDate } from "./columnDefinitions/startedDate";
import { treeType } from "./columnDefinitions/treeType";
import { actionMenu } from "./columnDefinitions/actionMenu";

interface Props {
  data: IdMap<PhyloRun> | undefined;
  isLoading: boolean;
}

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
