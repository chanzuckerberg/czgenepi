import cx from "classnames";
import Link from "next/link";
import React from "react";
import { API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import UserMenu from "./components/UserMenu";
import style from "./index.module.scss";
import { Logo, LogoAnchor } from "./style";

// (thuang): Please make sure this value is in sync with what we have in css
export const NAV_BAR_HEIGHT_PX = 50;

const NavBar = (): JSX.Element => {
  const { data } = useUserInfo();

  const group = data?.group;
  const user = data?.user;

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

  const signInLink = (
    <a href={ENV.API_URL + API.LOG_IN}>
      <div className={cx(style.item, style.link)}>Sign In</div>
    </a>
  );

  function isLoggedIn(): JSX.Element {
    if (user) {
      return <UserMenu user={user.name} />;
    } else {
      return signInLink;
    }
  }

  const rightEdge = isLoggedIn();

  const route = user ? ROUTES.DATA : ROUTES.HOMEPAGE;

  return (
    <div className={style.bar}>
      <div className={style.left}>
        <Link href={route} passHref>
          <LogoAnchor href="passHref">
            <Logo />
          </LogoAnchor>
        </Link>
        {orgSplash}
      </div>

      <div className={style.right}>{rightEdge}</div>
    </div>
  );
};

export default NavBar;
