import { Button } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { Menu, MenuItem } from "czifui";
import React from "react";
import style from "./index.module.scss";

interface TreeTableDownloadMenuProps {
  jsonLink: string;
  accessionsLink: string;
  shouldAllowDownload: boolean;
}

const TreeTableDownloadMenu = ({
  jsonLink,
  accessionsLink,
  shouldAllowDownload,
}: TreeTableDownloadMenuProps): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button
        onClick={handleClick}
        className={style.button}
        endIcon={<ExpandMore />}
      >
        Download
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        {shouldAllowDownload && (
          <a href={jsonLink} target="_blank" rel="noopener">
            <MenuItem onClick={handleClose}>{"Tree file (.json)"}</MenuItem>
          </a>
        )}
        <a href={accessionsLink} target="_blank" rel="noopener">
          <MenuItem onClick={handleClose}>{"Private IDs (.tsv)"}</MenuItem>
        </a>
      </Menu>
    </React.Fragment>
  );
};

export default TreeTableDownloadMenu;
