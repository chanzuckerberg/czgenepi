import FormHelperText from "@material-ui/core/FormHelperText";
import { DefaultMenuSelectOption, Dropdown } from "czifui";
import { FormikContextType } from "formik";
import { escapeRegExp } from "lodash/fp";
import React, { useEffect, useReducer, useState } from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";
import { StyledDiv } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  accessoryKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
  locationOptions: GisaidLocationOption[];
}

interface LocationSearchState {
  searching?: boolean;
  results: GisaidLocationOption[];
}

function locationSearchReducer(
  state: LocationSearchState,
  action: LocationSearchState | Partial<LocationSearchState>
): LocationSearchState {
  return { ...state, ...action };
}

export default function LocationField({
  fieldKey,
  accessoryKey,
  formik,
  applyToAllColumn,
  isFirstRow,
  locationOptions,
}: Props): JSX.Element {
  const { handleBlur, setFieldValue, values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const value = values[fieldKey] || null;

  const [selectedLocation, setLocation] = useState<
    GisaidLocationOption | undefined
  >();
  const [state, dispatch] = useReducer(locationSearchReducer, {
    results: [],
    searching: false,
  });

  useEffect(() => {
    const locationForID = locationOptions.find(
      (location) => location.id == value
    );
    setLocation(locationForID);
  });

  const searcher = (query: string): void => {
    if (query.length < 2) {
      dispatch({ results: [] });
      return;
    }
    dispatch({ searching: true });

    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredLocationOptions = locationOptions.filter((option) =>
      regex.test(option.name)
    );
    // alphabetical sort
    // this ensures partial locations (i.e. region, country and divison
    // but no location) end up on top.
    const sortedLocationOptions = filteredLocationOptions.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    dispatch({
      results: sortedLocationOptions.slice(0, 100),
      searching: false,
    });
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event?.target?.value ?? "";
    searcher(query);
  };

  const handleLocationChange = (e: DefaultMenuSelectOption | null) => {
    if (e) {
      const newLocation = e as GisaidLocationOption;
      setFieldValue(fieldKey, newLocation.id);
      setFieldValue(accessoryKey, newLocation.name);
    }
  };

  return (
    <StyledDiv onBlur={handleBlur}>
      <Dropdown
        label={selectedLocation?.name || "Search For Location"}
        value={selectedLocation}
        onChange={handleLocationChange}
        options={state.results}
        search={true}
        MenuSelectProps={{ onInputChange: handleSearchInputChange }}
      />
      <FormHelperText>
        {errorMessage ||
          (isFirstRow && value && (
            <ApplyToAllColumn
              fieldKey={fieldKey}
              value={value}
              handleClick={applyToAllColumn}
            />
          ))}
      </FormHelperText>
    </StyledDiv>
  );
}
