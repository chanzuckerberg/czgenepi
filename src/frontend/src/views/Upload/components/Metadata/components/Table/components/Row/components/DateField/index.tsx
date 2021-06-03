import TextField from "@material-ui/core/TextField";
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Metadata } from "src/views/Upload/components/common/types";

// "YYYY-MM-DD".length
const DATE_LENGTH = 10;

const INPUT_PROPS = {
  maxLength: DATE_LENGTH,
  minLength: DATE_LENGTH,
};

interface Props {
  fieldKey: keyof Metadata;
  register: UseFormRegister<Metadata>;
}

export default function DateField({ fieldKey, register }: Props): JSX.Element {
  const { ref, ...rest } = register(fieldKey, {
    maxLength: DATE_LENGTH,
    minLength: DATE_LENGTH,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    required: true,
  });

  return (
    <TextField
      inputRef={ref}
      inputProps={INPUT_PROPS}
      placeholder="YYYY-MM-DD"
      margin="dense"
      variant="outlined"
      {...rest}
    />
  );
}
