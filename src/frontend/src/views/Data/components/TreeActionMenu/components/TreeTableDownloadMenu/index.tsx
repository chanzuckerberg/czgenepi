import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, ReactNode, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { TREE_STATUS } from "src/common/constants/types";
import DownloadIcon from "src/common/icons/IconDownloadSmall.svg";
import { stringGuard } from "src/common/utils";
import { StyledIcon } from "../../style";

interface Props {
  item: TableItem;
  value: string;
}

const TreeTableDownloadMenu = ({ item, value }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick: MouseEventHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const jsonLink = stringGuard(value);
  const tsvDownloadLink = stringGuard(item["accessionsLink"]);
  const disabled = item?.status !== TREE_STATUS.Completed;
  // TODO (mlila): open sds bug -- tooltips should not display without content
  const MenuItemTooltip = ({
    children,
  }: {
    children: ReactNode;
  }): JSX.Element =>
    disabled ? (
      <Tooltip
        arrow
        title="This download is only available for completed trees."
        placement="top"
      >
        <div>{children}</div>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  return (
    <>
      <Tooltip arrow sdsStyle="dark" title="Download" placement="top">
        <StyledIcon onClick={handleClick}>
          <DownloadIcon />
        </StyledIcon>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <NewTabLink href={jsonLink}>
          <MenuItemTooltip>
            <MenuItem disabled={disabled} onClick={handleClose}>
              {"Tree file (.json)"}
            </MenuItem>
          </MenuItemTooltip>
        </NewTabLink>
        <NewTabLink href={tsvDownloadLink}>
          <MenuItem onClick={handleClose}>{"Private IDs (.tsv)"}</MenuItem>
        </NewTabLink>
      </Menu>
    </>
  );
};

export default TreeTableDownloadMenu;
