import { ColumnDef } from "@tanstack/react-table";
import { IdMap } from "src/common/utils/dataTransforms";
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
import { StyledCellBasic } from "./style";

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
  const { data: locationData = {} } = useLocations();
  const { locations } = locationData;

  const namedLocationsById = useMemo(
    () => getNamedLocationsById(locations),
    [locations]
  );

  const columns: ColumnDef<PhyloRun, any>[] = useMemo(() => {
    return [treeName(namedLocationsById), startedDate, treeType, actionMenu];
  }, [namedLocationsById]);

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
