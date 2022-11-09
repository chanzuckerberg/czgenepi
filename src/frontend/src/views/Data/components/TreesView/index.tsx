import { map } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HeadAppTitle } from "src/common/components";
import { useNewPhyloRunInfo as usePhyloRunInfo } from "src/common/queries/phyloRuns";
import { selectCurrentPathogen } from "src/common/redux/selectors";

const TreesView = (): JSX.Element => {
  // initialize state
  const [isDataLoading, setIsDataLoading] = useState(false);

  // load tree data from server
  const pathogen = useSelector(selectCurrentPathogen);
  const phyloRunResponse = usePhyloRunInfo(pathogen);
  const { data: phyloRuns, isLoading, isFetching } = phyloRunResponse;

  // determine whether we should show loading ui or interactive ui
  useEffect(() => {
    setIsDataLoading(true);

    if (isLoading || isFetching) return;

    setIsDataLoading(false);
  }, [isLoading, isFetching]);

  if (isDataLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <>
      <HeadAppTitle subTitle="Trees" />
      {map(phyloRuns, (r) => (
        <div>{r.id}</div>
      ))}
    </>
  );
};

export { TreesView };
