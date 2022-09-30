import { StyledFilterGroup, StyledFilterGroupName } from "../../style";

export type LocationFilterType = {
  availableLocations: NamedGisaidLocation[];
  selectedLocation: NamedGisaidLocation;
  setSelectedLocation: (location: NamedGisaidLocation) => void;
};

export const LocationFilter = (props: LocationFilterType): JSX.Element => {
  return (
    <StyledFilterGroup>
      <StyledFilterGroupName>Location</StyledFilterGroupName>
      <div>TODO - Location Filter</div>
    </StyledFilterGroup>
  );
};
