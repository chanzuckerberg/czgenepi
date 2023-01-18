import { DefaultMenuSelectOption } from "czifui";
import { compact, map, uniq } from "lodash";
import { useEffect, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { useNewSampleInfo as useSampleInfo } from "src/common/queries/samples";
import { IdMap } from "src/common/utils/dataTransforms";
import { FilterPanel } from "src/components/FilterPanel";
import { SearchBar } from "src/components/Table/components/SearchBar";
import { DataNavigation } from "../DataNavigation";
import SamplesTable from "./components/SamplesTable";
import { SampleTableModalManager } from "./components/SampleTableModalManager";
import { Flex, MaxWidth, StyledActionBar } from "./style";

const SamplesView = (): JSX.Element => {
  // initialize state
  // TODO-TR (mlilia): types

  // TODO-TR (mlila): consider restructuring table, modalmanager, and view to better manage
  // TODO             checked sample state

  // TODO-TR: when samples are cleared after closing a modal, the UI doesn't update
  const [checkedSamples, setCheckedSamples] = useState<Sample[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  const [dataFilterFunc, setDataFilterFunc] = useState<any>();
  const [lineages, setLineages] = useState<DefaultMenuSelectOption[]>([]);
  const [qcStatuses, setQCStatuses] = useState<DefaultMenuSelectOption[]>([]);
  // filters rows for current search query
  const [searchResults, setSearchResults] = useState<IdMap<Sample>>({});
  // rows that are actually shown in the table
  const [displayedRows, setDisplayedRows] = useState<IdMap<Sample>>({});

  // load sample data from server
  const { data: samples, isLoading } = useSampleInfo();

  // only display rows that match the current search and the current filters
  useEffect(() => {
    const hasSearchFilteredRows = Object.keys(searchResults).length > 0;
    if (!hasSearchFilteredRows) {
      setDisplayedRows({});
      return;
    }

    if (!dataFilterFunc) {
      setDisplayedRows(searchResults);
      return;
    }

    const filteredRows = dataFilterFunc(searchResults);
    setDisplayedRows(filteredRows);
  }, [searchResults, dataFilterFunc]);

  // update list of lineages to use in the filter panel on the left side of the screen
  useEffect(() => {
    const newLineages = uniq(
      compact(map(samples, (d) => d.lineages[0]?.lineage))
    )
      .sort()
      .map((name) => ({ name }));

    setLineages(newLineages);
  }, [samples]);

  // update list of qcStatuses to use in the filter panel on the left side of the screen
  useEffect(() => {
    const newQCStatuses = uniq(
      compact(map(samples, (d) => d.qcMetrics[0]?.qc_status))
    )
      .sort()
      .map((name) => ({ name }));

    setQCStatuses(newQCStatuses);
  }, [samples]);

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
        <MaxWidth data-test-id="scroll-container">
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
            setCheckedSamples={setCheckedSamples}
          />
        </MaxWidth>
      </Flex>
    </>
  );
};

export { SamplesView };
