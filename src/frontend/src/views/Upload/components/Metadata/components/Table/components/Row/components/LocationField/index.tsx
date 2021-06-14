import { MenuItem } from "czifui";
import { FormikContextType } from "formik";
import React from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";
import { COUNTIES } from "./COUNTIES";
import { MenuSubtext, StyledTextField } from "./style";

const SELECT_PROPS = {
  displayEmpty: true,
  renderValue,
};

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
}

export default function LocationField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
}: Props): JSX.Element {
  const { handleChange, handleBlur, values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const value = values[fieldKey] || "";

  return (
    <StyledTextField
      select
      SelectProps={SELECT_PROPS}
      name={fieldKey}
      value={value}
      margin="dense"
      variant="outlined"
      onChange={handleChange}
      onBlur={handleBlur}
      error={Boolean(errorMessage)}
      helperText={
        errorMessage ||
        (isFirstRow && value && (
          <ApplyToAllColumn
            fieldKey={fieldKey}
            value={value}
            handleClick={applyToAllColumn}
          />
        ))
      }
    >
      <MenuItem value="" disabled>
        Select County
      </MenuItem>
      {COUNTIES.map((county) => {
        return (
          <MenuItem key={county} value={county}>
            {county}
            {(county === "California" && (
              <MenuSubtext>County not specified</MenuSubtext>
            )) ||
              null}
          </MenuItem>
        );
      })}
    </StyledTextField>
  );
}

function renderValue(value: unknown): React.ReactNode {
  return <>{value}</>;
}
