import { Button } from "czifui";
import { useRef, useState } from "react";
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
  isLoading?: boolean;
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
  isLoading = false,
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
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : text}
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
