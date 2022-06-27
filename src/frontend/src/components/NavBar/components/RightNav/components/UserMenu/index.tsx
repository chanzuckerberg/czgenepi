import { Button } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { createStyles, makeStyles } from "@material-ui/styles";
import { AppThemeOptions, Menu, MenuItem } from "czifui";
import React from "react";
import { API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { ROUTES } from "src/common/routes";

const useStyles = makeStyles((theme: AppThemeOptions) => {
  const palette = theme.palette;

  return createStyles({
    text: {
      color: palette?.common?.white,
    },
  });
});

interface UserMenuProps {
  user: string | undefined;
}

const UserMenu = ({ user }: UserMenuProps): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const classes = useStyles();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        data-test-id="nav-user-menu"
        onClick={handleClick}
        classes={classes}
        endIcon={<ExpandMore />}
      >
        {user}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <a href={ROUTES.CONTACT_US_EMAIL} target="_blank" rel="noopener">
          <MenuItem onClick={handleClose}>Contact us</MenuItem>
        </a>
        <a href={ROUTES.HELP_CENTER} target="_blank" rel="noopener">
          <MenuItem onClick={handleClose}>Help Center</MenuItem>
        </a>
        <a href={ROUTES.RESOURCES} target="_blank" rel="noopener">
          <MenuItem onClick={handleClose}>Learning Center</MenuItem>
        </a>
        <a href={ROUTES.TERMS} target="_blank" rel="noopener">
          <MenuItem onClick={handleClose}>Terms of Use</MenuItem>
        </a>
        <a href={ROUTES.PRIVACY} target="_blank" rel="noopener">
          <MenuItem onClick={handleClose}>Privacy Policy</MenuItem>
        </a>
        <a href={ENV.API_URL + API.LOG_OUT}>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </a>
      </Menu>
    </>
  );
};

export default UserMenu;
