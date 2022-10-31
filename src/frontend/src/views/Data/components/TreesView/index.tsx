import { HeadAppTitle } from "src/common/components";
import { useNewPhyloRunInfo as usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { StyledView } from "../../style";
import { DataNavigation } from "../DataNavigation";
import { TreesTable } from "./components/TreesTable";

const TreesView = (): JSX.Element => {
  // load tree data from server
  const phyloRunResponse = usePhyloRunInfo();
  const { data: phyloRuns, isLoading, isFetching } = phyloRunResponse;

  return (
    <StyledView>
      <HeadAppTitle subTitle="Trees" />
      <DataNavigation />
      <TreesTable isLoading={isLoading || isFetching} data={phyloRuns} />
    </StyledView>
  );
};

export { TreesView };
