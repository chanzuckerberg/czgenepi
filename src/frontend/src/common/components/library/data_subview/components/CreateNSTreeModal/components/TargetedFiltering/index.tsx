import { Button } from "czifui";
import { ResetFiltersType } from "../..";
import {
  LocationFilter,
  LocationFilterType,
} from "../SampleFiltering/components/LocationFilter";
import { SampleFilteringTooltip } from "../SampleFilteringTooltip";
import {
  FilterContainer,
  StyledExplainerTitle,
  StyledTitleContainer,
} from "./style";

interface Props extends LocationFilterType, ResetFiltersType {}

export const TargetedFiltering = ({
  namedLocations,
  selectedLocation,
  setSelectedLocation,
  isFilterEnabled,
  resetFilters,
}: Props): JSX.Element => {
  return (
    <FilterContainer>
      <StyledTitleContainer>
        <StyledExplainerTitle>
          Prefer closely-related samples from (location):
          <SampleFilteringTooltip />
        </StyledExplainerTitle>
        {isFilterEnabled && (
          <Button
            onClick={resetFilters}
            sdsType="primary"
            sdsStyle="minimal"
            isAllCap
          >
            Reset
          </Button>
        )}
      </StyledTitleContainer>
      <LocationFilter
        fullWidth
        showTitle={false}
        namedLocations={namedLocations}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
    </FilterContainer>
  );
};
