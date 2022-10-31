import { DefaultMenuSelectOption } from "czifui";
import { compact, map, noop, uniq } from "lodash";
import { useEffect, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useNewSampleInfo as useSampleInfo } from "src/common/queries/samples";
import { FilterPanel } from "src/components/FilterPanel";
import { SearchBar } from "src/components/Table/components/SearchBar";
import { StyledView } from "../../style";
import { DataNavigation } from "../DataNavigation";
import { SamplesTable } from "./components/SamplesTable";
import { Flex } from "./style";

const SamplesView = (): JSX.Element => {
  // initialize state
  // TODO-TR (mlilia): types
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  // @ts-expect-error: temp
  const [dataFilterFunc, setDataFilterFunc] = useState<any>(); // eslint-disable-line
  const [lineages, setLineages] = useState<DefaultMenuSelectOption[]>([]);
  const [displayedRows, setDisplayedRows] = useState<IdMap<Sample>>({});

  // load sample data from server
  const { data: samples, isFetching, isLoading } = useSampleInfo();

  // update list of lineages to use in the filter panel on the left side of the screen
  useEffect(() => {
    const lineages = uniq(compact(map(samples, (d) => d.lineage?.lineage)))
      .sort()
      .map((name) => ({ name }));

    setLineages(lineages);
  }, [samples]);

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  return (
    <StyledView>
      <HeadAppTitle subTitle="Samples" />
      <DataNavigation
        shouldShowSampleFilterToggle
        activeFilterCount={0} // TODO-TR (mlila): use actual count
        toggleFilterPanel={toggleFilterPanel}
      />
      <Flex>
        <FilterPanel
          lineages={lineages}
          isOpen={isFilterPanelOpen}
          setActiveFilterCount={noop}
          setDataFilterFunc={setDataFilterFunc}
          data-test-id="menu-item-sample-count"
        />
        <div>
          <SearchBar tableData={samples} onSearchComplete={setDisplayedRows} />
          <SamplesTable
            isLoading={isLoading || isFetching}
            data={displayedRows}
          />
        </div>
      </Flex>
    </StyledView>
  );
};

export { SamplesView };
