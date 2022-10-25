import { Icon } from "czifui";
import Link from "next/link";
import { MouseEventHandler, useState } from "react";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { HiddenLabel } from "src/common/styles/accessibility";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import { InviteModal } from "src/views/GroupMembersPage/components/MembersTab/components/InviteModal";
import RightNav from "../RightNav";
import { GroupDetailsDropdown } from "./components/GroupDetailsDropdown";
import { PathogenTabs } from "./components/PathogenTabs";
import {
  DropdownClickTarget,
  LeftNav,
  Logo,
  LogoAnchor,
  NavBar,
  NavOrg,
  Separator,
  StyledNavIconWrapper,
} from "./style";

/*
 * This nav bar is shown when a user is both authenticated and
 * viewing pages that are "inside" the application
 * aka behind auth logic
 */
const AppNavBar = (): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [isGroupDetailsDropdownOpen, setIsGroupDetailsDropdownOpen] =
    useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const { data: userInfo } = useUserInfo();

  const group = getCurrentGroupFromUserInfo(userInfo);
  const route = userInfo ? ROUTES.DATA : ROUTES.HOMEPAGE;

  const toggleDropdown: MouseEventHandler = (e) => {
    const newAnchor = isGroupDetailsDropdownOpen ? null : e.currentTarget;
    setAnchorEl(newAnchor);
    setIsGroupDetailsDropdownOpen(!isGroupDetailsDropdownOpen);
  };

  const name = group?.name;

  return (
    <NavBar data-test-id="navbar">
      <LeftNav>
        <HiddenLabel id="logo-label">CZ Gen Epi Logo. Go to data.</HiddenLabel>
        <Link href={route} passHref>
          <LogoAnchor aria-labelledby="logo-label" href="passHref">
            <Logo data-test-id="logo" aria-hidden="true" />
          </LogoAnchor>
        </Link>
        <PathogenTabs />
        {name && (
          <>
            <Separator />
            <InviteModal
              onClose={() => setIsInviteModalOpen(false)}
              open={isInviteModalOpen}
              groupName={name}
            />
            <DropdownClickTarget onClick={toggleDropdown}>
              <NavOrg>{name}</NavOrg>
              <StyledNavIconWrapper>
                <Icon sdsIcon="chevronDown" sdsSize="xs" sdsType="static" />
              </StyledNavIconWrapper>
              <GroupDetailsDropdown
                anchorEl={anchorEl}
                onClickInvite={() => setIsInviteModalOpen(true)}
                open={isGroupDetailsDropdownOpen}
              />
            </DropdownClickTarget>
          </>
        )}
      </LeftNav>
      <RightNav />
    </NavBar>
  );
};

export default AppNavBar;
