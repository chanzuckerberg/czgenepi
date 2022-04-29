import { Button } from "czifui";
import React, { useRef, useState } from "react";
import { noop } from "src/common/constants/empty";
import ConfirmDialog from "../ConfirmDialog";
import { HiddenInput } from "./style";

interface Props {
  handleFiles: (files: FileList | null) => void;
  text?: string;
  multiple?: boolean;
  accept?: string;
  className?: string;
  shouldConfirm?: boolean;
  confirmTitle?: string;
  confirmContent?: string;
  isDisabled?: boolean;
  // This prop is used by the edit flow (clears metadata changes when a user imports a new tsv file)
  resetMetadataFromCheckedSamples?: () => void;
}

export default function FilePicker({
  handleFiles,
  text = "Select files",
  multiple = false,
  accept = "",
  className,
  shouldConfirm,
  confirmTitle = "",
  confirmContent = "",
  isDisabled = false,
  resetMetadataFromCheckedSamples = noop,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  function handleClick() {
    const current = hiddenFileInput.current;

    if (!current) return;

    current.value = "";

    current.click();

    if (isOpen) {
      setIsOpen(false);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = (event.target as HTMLInputElement).files;
    resetMetadataFromCheckedSamples();
    handleFiles(files);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function openDialog() {
    setIsOpen(true);
  }

  return (
    <div className={className}>
      <Button
        sdsType="primary"
        sdsStyle="square"
        onClick={shouldConfirm ? openDialog : handleClick}
        disabled={isDisabled}
      >
        {text}
      </Button>

      <HiddenInput
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        multiple={multiple}
        accept={accept}
      />

      {shouldConfirm && (
        <ConfirmDialog
          onConfirm={handleClick}
          open={isOpen}
          onClose={handleClose}
          title={confirmTitle}
          content={confirmContent}
        />
      )}
    </div>
  );
}
