import { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useNewPhyloRunInfo as usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { IdMap } from "src/common/utils/dataTransforms";
import { SearchBar } from "src/components/Table/components/SearchBar";
import { StyledView } from "../../style";
import { DataNavigation } from "../DataNavigation";
import { TreeCreateHelpLink } from "./components/TreeCreateHelpLink";
import { TreesTable } from "./components/TreesTable";
import { Flex } from "./style";

const TreesView = (): JSX.Element => {
  const [displayedRows, setDisplayedRows] = useState<IdMap<PhyloRun>>({});

  // load tree data from server
  const phyloRunResponse = usePhyloRunInfo();
  const { data: phyloRuns, isLoading, isFetching } = phyloRunResponse;

  return (
    <StyledView>
      <HeadAppTitle subTitle="Trees" />
      <DataNavigation />
      <div>
        <Flex>
          <SearchBar
            tableData={phyloRuns}
            onSearchComplete={setDisplayedRows}
          />
          <TreeCreateHelpLink />
        </Flex>
        <TreesTable isLoading={isLoading || isFetching} data={displayedRows} />
      </div>
    </StyledView>
  );
};

export { TreesView };
