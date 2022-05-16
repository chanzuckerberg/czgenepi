import FormHelperText from "@material-ui/core/FormHelperText";
import { DefaultMenuSelectOption, DropdownPopper } from "czifui";
import { FormikContextType } from "formik";
import { escapeRegExp, isEqual } from "lodash/fp";
import React, { useEffect, useState } from "react";
import { valueType } from "src/components/DateField";
import { Metadata } from "src/components/WebformTable/common/types";
import { NamedGisaidLocation } from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";
import { StyledDiv, StyledDropdown } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
  locations: NamedGisaidLocation[];
  shouldShowEditedCellsAsMarked?: boolean; // used to mark edited cells as purple for crud
}

interface AutocompleteState {
  getOptionLabel: (option: NamedGisaidLocation) => string;
  inputValue: string;
}

type ScienceDesignStage = "default" | "userInput" | undefined;

export default function LocationField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
  locations,
  shouldShowEditedCellsAsMarked = false,
}: Props): JSX.Element {
  const { handleBlur, setFieldValue, values, touched, errors, initialValues } =
    formik;
  const [isBackgroundColorShown, setBackgroundColorShown] =
    useState<boolean>(false);
  const [changedValue, setChangedValue] = useState<valueType>(undefined);
  const [initialValue, setInitialValue] = useState<valueType>(undefined);

  useEffect(() => {
    setChangedValue(values[fieldKey]);
    setInitialValue(initialValues[fieldKey]);
  }, [fieldKey, initialValues, values]);
  useEffect(() => {
    if (!isEqual(initialValue, changedValue) && shouldShowEditedCellsAsMarked) {
      setBackgroundColorShown(true);
    } else {
      setBackgroundColorShown(false);
    }
  }, [initialValue, changedValue, shouldShowEditedCellsAsMarked]);

  let value: NamedGisaidLocation | undefined = undefined;
  if (values[fieldKey]) {
    value = values[fieldKey] as NamedGisaidLocation;
  }
  /**
   * TODO REMOVE in near term
   * HOTFIX somewhat hacky code
   * Will reevaluate in a few days
   *
   * Issue is that because collectionLocation is now an object rather than a
   * simple string, the `errors[fieldKey]` results in an object rather than a simple
   * string. When that gets injected into React, boooom.
   * We avoid by checking for existence of an error object for the fieldKey, then
   * just use a hardcoded error message.
   *
   * This should only be an issue for TSV upload, since it's impossible to choose an
   * unrecognized location during interaction with the dropdown.
   */
  // Original line below
  // const errorMessage = touched[fieldKey] && errors[fieldKey];
  const hasErrorInLocation = touched[fieldKey] && errors[fieldKey];
  const errorMessage = hasErrorInLocation
    ? "Location was not recognized."
    : undefined;
  /**
   * END HOTFIX
   */

  const filter = (
    options: NamedGisaidLocation[],
    state: AutocompleteState
  ): NamedGisaidLocation[] => {
    const query = state.inputValue;
    const results: NamedGisaidLocation[] = [];
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
    const sortedLocationOptions = filteredLocationOptions.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return results.concat(sortedLocationOptions.slice(0, 99));
  };

  const handleLocationChange = (
    e: DefaultMenuSelectOption | DefaultMenuSelectOption[] | null
  ) => {
    // we don't allow multiple select in the dropdown, so e will always be a
    // single DefaultMenuSelectOption
    if (e) {
      const newLocation = e as NamedGisaidLocation;
      setFieldValue(fieldKey, newLocation);
    }
  };

  let sdsStage: ScienceDesignStage = "default";
  if (value) {
    sdsStage = "userInput";
  }

  return (
    <StyledDiv onBlur={handleBlur}>
      <StyledDropdown
        label={value?.name || "Search For Location"}
        value={value}
        onChange={handleLocationChange}
        isBackgroundColorShown={isBackgroundColorShown}
        options={locations}
        search
        MenuSelectProps={{
          filterOptions: filter,
          sdsStage: "userInput",
        }}
        InputDropdownProps={{ sdsStyle: "square", sdsStage: sdsStage }}
        PopperComponent={(props: any) => (
          <DropdownPopper placement="bottom-start" {...props} />
        )}
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
