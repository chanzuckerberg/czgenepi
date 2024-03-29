import { PopperProps } from "@mui/material";
import { DefaultMenuSelectOption, DropdownPopper } from "czifui";
import { escapeRegExp } from "lodash";
import {
  StyledDropdown,
  StyledFilterGroup,
  StyledFilterGroupName,
} from "../../style";

export type LocationFilterType = {
  namedLocations: NamedGisaidLocation[];
  selectedLocation: NamedGisaidLocation | null;
  setSelectedLocation: (location: NamedGisaidLocation | null) => void;
};

interface LocationFilterStyleProps {
  fullWidth?: boolean;
  showTitle?: boolean;
}

interface LocationFilterProps
  extends LocationFilterType,
    LocationFilterStyleProps {}

interface AutocompleteState {
  getOptionLabel: (option: NamedGisaidLocation) => string;
  inputValue: string;
}

// Note: much of the logic here is very similar to the
// LocationField component used in file upload/edit
// We should revisit and refactor if this comes up again.
export const LocationFilter = ({
  fullWidth = false,
  showTitle = true,
  namedLocations,
  selectedLocation,
  setSelectedLocation,
}: LocationFilterProps): JSX.Element => {
  const locationOptions = namedLocations
    ? namedLocations.map((location) => {
        return {
          ...location,
          key: location.id,
        };
      })
    : [];

  const filterLocations = (
    options: NamedGisaidLocation[],
    state: AutocompleteState
  ): NamedGisaidLocation[] => {
    const query = state.inputValue;
    const results: NamedGisaidLocation[] = [];
    if (selectedLocation) {
      results.push(selectedLocation);
    }
    if (query.length < 3) {
      return results;
    }

    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredLocationOptions = options.filter((location) =>
      regex.test(location.name)
    );
    // alphabetical sort
    // this ensures partial locations (i.e. region, country and divison
    // but no location) end up on top.
    const sortedLocationOptions = filteredLocationOptions.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return results.concat(sortedLocationOptions.slice(0, 99));
  };

  const handleLocationDropdownChange = (
    newSelectedOptions:
      | DefaultMenuSelectOption
      | DefaultMenuSelectOption[]
      | null
  ): void => {
    if (newSelectedOptions && !Array.isArray(newSelectedOptions)) {
      const newLocation =
        namedLocations.find(
          (location) => location.name === newSelectedOptions.name
        ) || null;
      if (newLocation && newLocation.id !== selectedLocation?.id) {
        setSelectedLocation(newLocation);
      }
    }
  };

  return (
    <StyledFilterGroup fullWidth={fullWidth}>
      {showTitle && <StyledFilterGroupName>Location</StyledFilterGroupName>}
      <StyledDropdown
        fullWidth={fullWidth}
        label={selectedLocation?.name || "Search for location"}
        value={selectedLocation}
        onChange={handleLocationDropdownChange}
        options={locationOptions}
        search
        DropdownMenuProps={{
          filterOptions: filterLocations,
        }}
        InputDropdownProps={{ sdsStyle: "square", sdsStage: "userInput" }}
        PopperComponent={(props: PopperProps) => (
          <DropdownPopper placement="bottom-start" {...props} />
        )}
      />
    </StyledFilterGroup>
  );
};
