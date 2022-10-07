import {
  LocationFilter,
  LocationFilterType,
} from "../SampleFiltering/components/LocationFilter";
import { SampleFilteringTooltip } from "../SampleFilteringTooltip";
import { FilterContainer, StyledExplainerTitle } from "./style";

export const TargetedFiltering = ({
  namedLocations,
  selectedLocation,
  setSelectedLocation,
}: LocationFilterType): JSX.Element => {
  return (
    <FilterContainer>
      <StyledExplainerTitle>
        Prefer closely-related samples from (location):
        <SampleFilteringTooltip />
      </StyledExplainerTitle>
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
