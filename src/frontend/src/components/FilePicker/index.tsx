import { Button } from "czifui";
import React, { useRef } from "react";
import { HiddenInput } from "./style";

interface Props {
  handleFiles: (files: FileList | null) => void;
  text?: string;
  multiple?: boolean;
  accept?: string;
}

export default function FilePicker({
  handleFiles,
  text = "Select files",
  multiple = false,
  accept = "",
}: Props): JSX.Element {
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    const current = hiddenFileInput.current;

    if (!current) return;

    current.value = "";

    current.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = (event.target as HTMLInputElement).files;

    handleFiles(files);
  };

  return (
    <>
      <Button color="primary" variant="contained" onClick={handleClick}>
        {text}
      </Button>

      <HiddenInput
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        multiple={multiple}
        accept={accept}
      />
    </>
  );
}
