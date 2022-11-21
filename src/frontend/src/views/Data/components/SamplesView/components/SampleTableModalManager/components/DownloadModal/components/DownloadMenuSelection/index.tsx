import { Tooltip } from "czifui";
import { ReactNode, useState } from "react";
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
  downloadTitle: string;
  fileTypes: string;
  children: ReactNode;
  tooltipTitle?: ReactNode;
}

const DownloadMenuSelection = ({
  id,
  isChecked,
  isDisabled,
  onChange,
  downloadTitle,
  fileTypes,
  children,
  tooltipTitle,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const menuItem = (
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
        <span onMouseOver={(e) => setAnchorEl(e.currentTarget)}>
          <DownloadType>{downloadTitle} </DownloadType> ({fileTypes})
        </span>
        <DownloadTypeInfo>{children}</DownloadTypeInfo>
      </CheckboxLabel>
    </StyledFileTypeItem>
  );

  if (!tooltipTitle) return menuItem;

  return (
    <Tooltip
      arrow
      inverted
      title={tooltipTitle}
      disableHoverListener={!isDisabled}
      placement="top"
      PopperProps={{
        anchorEl,
      }}
    >
      {menuItem}
    </Tooltip>
  );
};

export { DownloadMenuSelection };
