import { useTreatments } from "@splitsoftware/splitio-react";
import { Icon } from "czifui";
import Link from "next/link";
import React, { MouseEventHandler, useState } from "react";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { FEATURE_FLAGS, isFlagOn } from "src/components/Split";
import { InviteModal } from "src/views/GroupMembersPage/components/MembersTab/components/InviteModal";
import { GroupDetailsDropdown } from "./components/GroupDetailsDropdown";
import RightNav from "./components/RightNav";
import {
  DropdownClickTarget,
  LeftNav,
  Logo,
  LogoAnchor,
  NavBar,
  NavOrg,
  Separator,
  StyledIcon,
} from "./style";

const NavBarLoggedIn = (): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [isGroupDetailsDropdownOpen, setIsGroupDetailsDropdownOpen] =
    useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const { data: userInfo } = useUserInfo();

  const group = userInfo?.group;
  const route = userInfo ? ROUTES.DATA : ROUTES.HOMEPAGE;

  const flag = useTreatments([FEATURE_FLAGS.user_onboarding_v0]);
  const isUserOnboardingFlagOn = isFlagOn(
    flag,
    FEATURE_FLAGS.user_onboarding_v0
  );

  const toggleDropdown: MouseEventHandler = (e) => {
    const newAnchor = isGroupDetailsDropdownOpen ? null : e.currentTarget;
    setAnchorEl(newAnchor);
    setIsGroupDetailsDropdownOpen(!isGroupDetailsDropdownOpen);
  };

  const orgElements = (
    <React.Fragment>
      <Separator />
      <NavOrg>{group?.name}</NavOrg>
    </React.Fragment>
  );

  function hasOrg(): JSX.Element | null {
    if (group === undefined) {
      return null;
    } else {
      return orgElements;
    }
  }

  const orgSplash = hasOrg();
  const name = group?.name;

  return (
    <NavBar data-test-id="navbar">
      <LeftNav>
        <Link href={route} passHref>
          <LogoAnchor href="passHref">
            <Logo data-test-id="logo" />
            {!isUserOnboardingFlagOn && orgSplash}
          </LogoAnchor>
        </Link>
        {name && isUserOnboardingFlagOn && (
          <>
            <Separator />
            <InviteModal
              onClose={() => setIsInviteModalOpen(false)}
              open={isInviteModalOpen}
              groupName={name}
            />
            <DropdownClickTarget onClick={toggleDropdown}>
              <NavOrg>{name}</NavOrg>
              <StyledIcon>
                <Icon sdsIcon="chevronDown" sdsSize="xs" sdsType="static" />
              </StyledIcon>
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

export default NavBarLoggedIn;
