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

interface AutocompleteState {
  getOptionLabel: (option: NamedGisaidLocation) => string;
  inputValue: string;
}

export const LocationFilter = ({
  namedLocations,
  selectedLocation,
  setSelectedLocation,
}: LocationFilterType): JSX.Element => {
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
      setSelectedLocation(newLocation);
    }
  };

  return (
    <StyledFilterGroup>
      <StyledFilterGroupName>Location</StyledFilterGroupName>
      <StyledDropdown
        label={selectedLocation?.name || "Search for location"}
        value={selectedLocation}
        onChange={handleLocationDropdownChange}
        options={namedLocations}
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
