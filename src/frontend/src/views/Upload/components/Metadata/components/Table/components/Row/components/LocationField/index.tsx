import { escapeRegExp } from "lodash/fp";
import { Dropdown, DefaultMenuSelectOption } from "czifui";
import { FormikContextType } from "formik";
import React, { useState, useReducer, useEffect } from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";
import { StyledDiv } from "./style";

interface Props {
  fieldKey: keyof Metadata;
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
  formik,
  applyToAllColumn,
  isFirstRow,
  locationOptions,
}: Props): JSX.Element {
  const { handleBlur, setFieldValue, values } = formik;

  // const errorMessage = touched[fieldKey] && errors[fieldKey];

  const formikIDValue = values[fieldKey] || null;

  const [selectedLocation, setLocation] = useState<
    GisaidLocationOption | undefined
  >();
  const [state, dispatch] = useReducer(locationSearchReducer, {
    results: [],
    searching: false,
  });

  useEffect(() => {
    const locationForID = locationOptions.find(
      (location) => location.id == formikIDValue
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
    if (!!e) {
      const newLocation = e as GisaidLocationOption;
      setFieldValue(fieldKey, newLocation.id);
    }
  };

  return (
    <StyledDiv onBlur={handleBlur}>
      <Dropdown
        label={selectedLocation?.name || "Select Location"}
        value={selectedLocation}
        onChange={handleLocationChange}
        options={state.results}
        search={true}
        MenuSelectProps={{ onInputChange: handleSearchInputChange }}
      />
    </StyledDiv>
  );

  // return (
  //   <StyledTextField
  //     select
  //     SelectProps={SELECT_PROPS}
  //     name={fieldKey}
  //     value={value}
  //     margin="dense"
  //     variant="outlined"
  //     onChange={handleChange}
  //     onBlur={handleBlur}
  //     error={Boolean(errorMessage)}
  //     helperText={
  //       errorMessage ||
  //       (isFirstRow && value && (
  //         <ApplyToAllColumn
  //           fieldKey={fieldKey}
  //           value={value}
  //           handleClick={applyToAllColumn}
  //         />
  //       ))
  //     }
  //   >
  //     <MenuItem value="" disabled>
  //       Select County
  //     </MenuItem>
  //     {COUNTIES.map((county) => {
  //       return (
  //         <MenuItem key={county} value={county}>
  //           {county}
  //           {(county === "California" && (
  //             <MenuSubtext>County not specified</MenuSubtext>
  //           )) ||
  //             null}
  //         </MenuItem>
  //       );
  //     })}
  //   </StyledTextField>
  // );
}

// function renderValue(value: unknown): React.ReactNode {
//   return <>{value}</>;
// }
