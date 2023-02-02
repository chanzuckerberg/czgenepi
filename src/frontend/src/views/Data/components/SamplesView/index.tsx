import { compact, map, uniq } from "lodash";
import { useMemo, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useNewSampleInfo as useSampleInfo } from "src/common/queries/samples";
import { IdMap } from "src/common/utils/dataTransforms";
import { FilterPanel } from "src/components/FilterPanel";
import { SearchBar } from "src/components/Table/components/SearchBar";
import { DataNavigation } from "../DataNavigation";
import { SamplesTable } from "./components/SamplesTable";
import { SampleTableModalManager } from "./components/SampleTableModalManager";
import { Flex, MaxWidth, StyledActionBar } from "./style";

const SamplesView = (): JSX.Element => {
  // TODO-TR: when samples are cleared after closing a modal, the UI doesn't update
  const [checkedSamples, setCheckedSamples] = useState<Sample[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  const [dataFilterFunc, setDataFilterFunc] = useState<any>();
  // filters rows for current search query
  const [searchResults, setSearchResults] = useState<IdMap<Sample>>({});

  // load sample data from server
  const { data: samples, isLoading } = useSampleInfo();

  // only display rows that match the current search and the current filters.
  // what's returned here will be the rows that are actually shown in the table.
  const displayedRows = useMemo(() => {
    const hasSearchFilteredRows = Object.keys(searchResults).length > 0;
    if (!hasSearchFilteredRows) {
      return {};
    }

    if (!dataFilterFunc) {
      return searchResults;
    }

    return dataFilterFunc(searchResults);
  }, [searchResults, dataFilterFunc]);

  // update list of lineages to use in the filter panel on the left side of the screen
  const lineages = useMemo(
    () =>
      uniq(compact(map(samples, (d) => d.lineages[0]?.lineage)))
        .sort()
        .map((name) => ({ name })),
    [samples]
  );

  // update list of qcStatuses to use in the filter panel on the left side of the screen
  const qcStatuses = useMemo(
    () =>
      uniq(compact(map(samples, (d) => d.qcMetrics[0]?.qcStatus)))
        .sort()
        .map((name) => ({ name })),
    [samples]
  );

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  return (
    <>
      <HeadAppTitle subTitle="Samples" />
      <DataNavigation
        shouldShowSampleFilterToggle
        activeFilterCount={activeFilterCount}
        toggleFilterPanel={toggleFilterPanel}
      />
      <Flex>
        <FilterPanel
          lineages={lineages}
          qcStatuses={qcStatuses}
          isOpen={isFilterPanelOpen}
          setActiveFilterCount={setActiveFilterCount}
          setDataFilterFunc={setDataFilterFunc}
          data-test-id="menu-item-sample-count"
        />
        <MaxWidth>
          <StyledActionBar>
            <SearchBar
              tableData={samples}
              onSearchComplete={setSearchResults}
            />
            <SampleTableModalManager
              checkedSamples={checkedSamples}
              clearCheckedSamples={() => setCheckedSamples([])}
            />
          </StyledActionBar>
          <SamplesTable
            isLoading={isLoading}
            data={displayedRows}
            checkedSamples={checkedSamples}
            setCheckedSamples={setCheckedSamples}
          />
        </MaxWidth>
      </Flex>
    </>
  );
};

export { SamplesView };
