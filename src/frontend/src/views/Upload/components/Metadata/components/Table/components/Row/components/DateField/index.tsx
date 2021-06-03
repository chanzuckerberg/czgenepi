import TextField from "@material-ui/core/TextField";
import React from "react";

const INPUT_PROPS = {
  maxLength: "10",
};

interface Props {
  fieldKey: string;
  handleValue: (fieldKey: string, value: string) => void;
}

export default function DateField({
  fieldKey,
  handleValue,
}: Props): JSX.Element {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    handleValue(fieldKey, value);
  };

  return (
    <TextField
      inputProps={INPUT_PROPS}
      placeholder="YYYY-MM-DD"
      margin="dense"
      variant="outlined"
      onChange={handleChange}
    />
  );
}
