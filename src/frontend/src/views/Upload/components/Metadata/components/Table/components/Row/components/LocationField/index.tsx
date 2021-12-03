import FormHelperText from "@material-ui/core/FormHelperText";
import { DefaultMenuSelectOption, Dropdown } from "czifui";
import { FormikContextType } from "formik";
import { escapeRegExp } from "lodash/fp";
import React from "react";
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

interface AutocompleteState {
  getOptionLabel: (option: NamedGisaidLocation) => string;
  inputValue: string;
}

export default function LocationField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
  locations,
}: Props): JSX.Element {
  const { handleBlur, setFieldValue, values, touched, errors } = formik;

  let value: NamedGisaidLocation | undefined = undefined;
  if (values[fieldKey]) {
    value = values[fieldKey] as NamedGisaidLocation;
  }

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const filter = (
    options: NamedGisaidLocation[],
    state: AutocompleteState
  ): NamedGisaidLocation[] => {
    const query = state.inputValue;
    let results: NamedGisaidLocation[] = [];
    if (value) {
      results.push(value);
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
    const sortedLocationOptions = filteredLocationOptions.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return results.concat(sortedLocationOptions.slice(0, 99));
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
        options={locations}
        search={true}
        MenuSelectProps={{
          filterOptions: filter,
        }}
        InputDropdownProps={{ sdsStyle: "square", sdsStage: "default" }}
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
