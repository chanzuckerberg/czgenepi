import { DefaultMenuSelectOption } from "czifui";
import { compact, map, uniq } from "lodash";
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
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  const [dataFilterFunc, setDataFilterFunc] = useState<any>();
  const [lineages, setLineages] = useState<DefaultMenuSelectOption[]>([]);
  // filters rows for current search query
  const [searchResults, setSearchResults] = useState<IdMap<Sample>>({});
  // rows that are actually shown in the table
  const [displayedRows, setDisplayedRows] = useState<IdMap<Sample>>({});

  // load sample data from server
  const { data: samples, isFetching, isLoading } = useSampleInfo();

  // load data into table on first load only
  useEffect(() => {
    setDisplayedRows(samples);
  }, []);

  // update list of lineages to use in the filter panel on the left side of the screen
  useEffect(() => {
    const newLineages = uniq(compact(map(samples, (d) => d.lineage?.lineage)))
      .sort()
      .map((name) => ({ name }));

    setLineages(newLineages);
  }, [samples]);

  // only display rows that match the current search and the current filters
  useEffect(() => {
    if (!dataFilterFunc) {
      setDisplayedRows(searchResults);
      return;
    }

    const filteredRows = dataFilterFunc(searchResults);
    setDisplayedRows(filteredRows);
  }, [searchResults, dataFilterFunc]);

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  return (
    <StyledView>
      <HeadAppTitle subTitle="Samples" />
      <DataNavigation
        shouldShowSampleFilterToggle
        activeFilterCount={activeFilterCount}
        toggleFilterPanel={toggleFilterPanel}
      />
      <Flex>
        <FilterPanel
          lineages={lineages}
          isOpen={isFilterPanelOpen}
          setActiveFilterCount={setActiveFilterCount}
          setDataFilterFunc={setDataFilterFunc}
          data-test-id="menu-item-sample-count"
        />
        <div>
          <SearchBar tableData={samples} onSearchComplete={setSearchResults} />
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
