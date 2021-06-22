import cx from "classnames";
import Link from "next/link";
import React from "react";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import RightNav from "./components/RightNav";
import style from "./index.module.scss";
import { Logo, LogoAnchor } from "./style";

// (thuang): Please make sure this value is in sync with what we have in css
export const NAV_BAR_HEIGHT_PX = 50;

const NavBar = (): JSX.Element => {
  const { data } = useUserInfo();

  const group = data?.group;

  const orgElements = (
    <React.Fragment>
      <div className={style.separator} />
      <div className={cx(style.item, style.org)}>{group?.name}</div>
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

  const route = data ? ROUTES.DATA : ROUTES.HOMEPAGE;

  return (
    <div className={style.bar} data-test-id="navbar">
      <div className={style.left}>
        <Link href={route} passHref>
          <LogoAnchor href="passHref">
            <Logo data-test-id="logo" />
          </LogoAnchor>
        </Link>
        {orgSplash}
      </div>

      <div className={style.right}>
        <RightNav />
      </div>
    </div>
  );
};

export default NavBar;
