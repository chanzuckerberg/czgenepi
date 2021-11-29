import FormHelperText from "@material-ui/core/FormHelperText";
import { DefaultMenuSelectOption, Dropdown } from "czifui";
import { FormikContextType } from "formik";
import { escapeRegExp } from "lodash/fp";
import React, { useReducer } from "react";
import {
  Metadata,
  NamedGisaidLocation,
} from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";
import { StyledDiv } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
  locations: NamedGisaidLocation[];
}

interface LocationSearchState {
  searching?: boolean;
  results: NamedGisaidLocation[];
}

function locationSearchReducer(
  state: LocationSearchState,
  action: LocationSearchState | Partial<LocationSearchState>
): LocationSearchState {
  return { ...state, ...action };
}

export default function LocationField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
  locations,
}: Props): JSX.Element {
  const { handleBlur, setFieldValue, values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  let value: NamedGisaidLocation | null = null;
  if (values[fieldKey]) {
    value = values[fieldKey] as NamedGisaidLocation;
  }

  const [state, dispatch] = useReducer(locationSearchReducer, {
    results: [],
    searching: false,
  });

  const searcher = async (query: string): Promise<void> => {
    if (query.length < 2) {
      dispatch({ results: [] });
      return;
    }
    dispatch({ searching: true });

    const regex = new RegExp(escapeRegExp(query), "i");
    const filteredLocationOptions = locations.filter((location) =>
      regex.test(location.name)
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
      const newLocation = e as NamedGisaidLocation;
      setFieldValue(fieldKey, newLocation);
    }
  };

  return (
    <StyledDiv onBlur={handleBlur}>
      <Dropdown
        label={value?.name || "Search For Location"}
        value={value}
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
