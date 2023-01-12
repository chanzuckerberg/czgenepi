import { Button } from "czifui";
import { ResetFiltersType } from "../..";
import { SampleFilteringTooltip } from "../SampleFilteringTooltip";
import {
  CollectionDateFilter,
  EndDateFilterType,
  StartDateFilterType,
} from "./components/CollectionDateFilter";
import { LineageFilter, LineageFilterType } from "./components/LineageFilter";
import {
  LocationFilter,
  LocationFilterType,
} from "./components/LocationFilter";

import {
  StyledContainer,
  StyledExplainerTitle,
  StyledFiltersSection,
  StyledTitleContainer,
} from "./style";

interface Props
  extends StartDateFilterType,
    EndDateFilterType,
    LineageFilterType,
    LocationFilterType,
    ResetFiltersType {}

/**
 * Provides filtering of samples that are automatically added to trees.
 *
 * For tree creation, the user can select samples to create a tree. But that
 * only makes up some of the samples that go into the tree: others are chosen
 * automatically through the tree building process and added. These filters
 * are intended to restrict that second category of samples: those chosen
 * automatically by downstream tree creation. These filters have no impact on
 * the samples explicitly chosen by the user.
 *
 */
export function SampleFiltering({
  availableLineages,
  isFilterEnabled,
  namedLocations,
  resetFilters,
  selectedLineages,
  selectedLocation,
  setSelectedLineages,
  setSelectedLocation,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: Props): JSX.Element {
  return (
    <StyledContainer>
      <StyledTitleContainer>
        <>
          <StyledExplainerTitle>
            Define samples of interest by:
            <SampleFilteringTooltip />
          </StyledExplainerTitle>
          {isFilterEnabled && (
            <Button
              onClick={resetFilters}
              sdsType="primary"
              sdsStyle="minimal"
              isAllCap
            >
              Reset all
            </Button>
          )}
        </>
      </StyledTitleContainer>
      <StyledFiltersSection>
        <LineageFilter
          availableLineages={availableLineages}
          selectedLineages={selectedLineages}
          setSelectedLineages={setSelectedLineages}
        />
        <CollectionDateFilter
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <LocationFilter
          namedLocations={namedLocations}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />
      </StyledFiltersSection>
    </StyledContainer>
  );
}
