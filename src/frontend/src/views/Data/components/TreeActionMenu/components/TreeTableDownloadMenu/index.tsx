import { Icon, ButtonIcon, Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, ReactNode, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { TREE_STATUS } from "src/common/constants/types";
import { stringGuard } from "src/common/utils";

interface Props {
  item: TableItem;
}

const TreeTableDownloadMenu = ({ item }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick: MouseEventHandler = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const jsonLinkIdStylePrivateIdentifiers = stringGuard(
    item["downloadLinkIdStylePrivateIdentifiers"]
  );
  const jsonLinkIdStylePublicIdentifiers = stringGuard(
    item["downloadLinkIdStylePublicIdentifiers"]
  );
  const tsvDownloadLink = stringGuard(item["accessionsLink"]);
  const disabled = item?.status !== TREE_STATUS.Completed;
  // TODO (mlila): This is necessary due to an sds bug -- MUI tooltips should not display
  // TODO          without content, but that functionality was accidentally removed here.
  // TODO          https://app.shortcut.com/sci-design-system/story/176947
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

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip arrow sdsStyle="dark" title="Download" placement="top">
        <ButtonIcon
          aria-label="download tree"
          onClick={handleClick}
          sdsSize="small"
          sdsType="primary"
          size="large"
        >
          <Icon sdsIcon="download" sdsSize="s" sdsType="iconButton" />
        </ButtonIcon>
      </Tooltip>
      {open && (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          open={open}
          onClose={handleClose}
          getContentAnchorEl={null}
        >
          <NewTabLink href={jsonLinkIdStylePrivateIdentifiers}>
            <MenuItemTooltip>
              <MenuItem disabled={disabled} onClick={handleClose}>
                {"Tree file with Private IDs (.json)"}
              </MenuItem>
            </MenuItemTooltip>
          </NewTabLink>
          <NewTabLink href={jsonLinkIdStylePublicIdentifiers}>
            <MenuItemTooltip>
              <MenuItem disabled={disabled} onClick={handleClose}>
                {"Tree file with Public IDs (.json)"}
              </MenuItem>
            </MenuItemTooltip>
          </NewTabLink>
          <NewTabLink href={tsvDownloadLink}>
            <MenuItem onClick={handleClose}>{"Private IDs (.tsv)"}</MenuItem>
          </NewTabLink>
        </Menu>
      )}
    </>
  );
};

export default TreeTableDownloadMenu;
