import { FormControlLabel, FormHelperText, Switch } from "@mui/material";
import { FormikContextType } from "formik";
import React from "react";
import { Metadata } from "src/components/WebformTable/common/types";
import { WarningWrapper, Wrapper } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  isDisabled?: boolean;
  isAutocorrected?: boolean;
}

export default function ToggleField({
  fieldKey,
  formik,
  isDisabled,
  isAutocorrected = false,
}: Props): JSX.Element {
  const { handleChange, handleBlur, values } = formik;

  // Truthy `value` <--> Yes, On, Enabled, True, Affirmed, etc
  const value = values[fieldKey] ?? false;

  return (
    <Wrapper>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={Boolean(value)}
            onChange={handleChange}
            color="primary"
            name={fieldKey}
            onBlur={handleBlur}
            value={value}
            disabled={isDisabled}
          />
        }
        label={value ? "Yes" : "No"}
      />
      {isAutocorrected && (
        <FormHelperText margin="dense" variant="filled">
          <WarningWrapper>Updated to resolve data conflict.</WarningWrapper>
        </FormHelperText>
      )}
    </Wrapper>
  );
}
