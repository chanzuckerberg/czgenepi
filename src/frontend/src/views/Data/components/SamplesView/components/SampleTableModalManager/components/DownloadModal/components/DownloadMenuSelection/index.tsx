import { ReactNode } from "react";
import {
  CheckBoxInfo,
  CheckboxLabel,
  DownloadType,
  DownloadTypeInfo,
  StyledCheckbox,
  StyledFileTypeItem,
} from "./style";

interface Props {
  id: string;
  isChecked: boolean;
  isDisabled: boolean;
  onChange(): void;
  title: string;
  fileTypes: string;
  children: ReactNode;
}

const DownloadMenuSelection = ({
  id,
  isChecked,
  isDisabled,
  onChange,
  title,
  fileTypes,
  children,
}: Props): JSX.Element => {
  return (
    <StyledFileTypeItem isSelected={isChecked} isDisabled={isDisabled}>
      <CheckBoxInfo>
        <StyledCheckbox
          id={id}
          disabled={isDisabled}
          onChange={onChange}
          stage={isChecked ? "checked" : "unchecked"}
        />
      </CheckBoxInfo>
      <CheckboxLabel htmlFor={id}>
        <DownloadType>{title} </DownloadType> ({fileTypes})
        <DownloadTypeInfo>{children}</DownloadTypeInfo>
      </CheckboxLabel>
    </StyledFileTypeItem>
  );
};

export { DownloadMenuSelection };
