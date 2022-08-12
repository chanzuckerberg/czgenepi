import { Icon, Menu, MenuItem } from "czifui";
import React from "react";
import { API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { ROUTES } from "src/common/routes";
import { StyledNavButton, StyledNavIconWrapper } from "./style";

interface UserMenuProps {
  user: string | undefined;
}

const UserMenu = ({ user }: UserMenuProps): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledNavButton
        data-test-id="nav-user-menu"
        onClick={handleClick}
        endIcon={
          <StyledNavIconWrapper>
            <Icon sdsIcon="chevronDown" sdsSize="xs" sdsType="static" />
          </StyledNavIconWrapper>
        }
      >
        {user}
      </StyledNavButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
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
