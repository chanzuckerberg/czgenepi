import Link from "next/link";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import RightNav from "./components/RightNav";
import { LeftNav, Logo, LogoAnchor, NavBar, NavOrg, Separator } from "./style";

// (thuang): Please make sure this value is in sync with what we have in css
export const NAV_BAR_HEIGHT_PX = 50;

const NavBarLoggedIn = (): JSX.Element => {
  const { data: userInfo } = useUserInfo();

  const group = userInfo?.group;

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

  const route = userInfo ? ROUTES.DATA : ROUTES.HOMEPAGE;

  return (
    <NavBar data-test-id="navbar">
      <LeftNav>
        <Link href={route} passHref>
          <LogoAnchor href="passHref">
            <Logo data-test-id="logo" />
            {orgSplash}
          </LogoAnchor>
        </Link>
      </LeftNav>

      <RightNav />
    </NavBar>
  );
};

export default NavBarLoggedIn;
