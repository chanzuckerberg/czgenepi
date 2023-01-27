import { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { IdMap } from "src/common/utils/dataTransforms";
import { SearchBar } from "src/components/Table/components/SearchBar";
import { DataNavigation } from "../DataNavigation";
import { MaxWidth } from "../SamplesView/style";
import { TreeCreateHelpLink } from "./components/TreeCreateHelpLink";
import { TreesTable } from "./components/TreesTable";
import { Flex } from "./style";

const TreesView = (): JSX.Element => {
  const [displayedRows, setDisplayedRows] = useState<IdMap<PhyloRun>>({});

  // load tree data from server
  const phyloRunResponse = usePhyloRunInfo();
  const { data: phyloRuns, isLoading } = phyloRunResponse;

  return (
    <>
      <HeadAppTitle subTitle="Trees" />
      <DataNavigation />
      <MaxWidth>
        <Flex>
          <SearchBar
            tableData={phyloRuns}
            onSearchComplete={setDisplayedRows}
          />
          <TreeCreateHelpLink />
        </Flex>
        <TreesTable isLoading={isLoading} data={displayedRows} />
      </MaxWidth>
    </>
  );
};

export { TreesView };
