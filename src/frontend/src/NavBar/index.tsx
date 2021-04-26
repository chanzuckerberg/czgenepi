import cx from "classnames";
import React from "react";
import { API } from "src/common/api";
import UserMenu from "./components/UserMenu";
import style from "./index.module.scss";

interface Props {
  org?: string;
  user?: string;
}

const NavBar = ({ org, user }: Props): JSX.Element => {
  const orgElements = (
    <React.Fragment>
      <div className={style.separator} />
      <div className={cx(style.item, style.org)}>{org}</div>
    </React.Fragment>
  );

  function hasOrg(): JSX.Element | null {
    if (org === undefined) {
      return null;
    } else {
      return orgElements;
    }
  }

  const orgSplash = hasOrg();

  const signInLink = (
    <a href={process.env.API_URL + API.LOG_IN}>
      <div className={cx(style.item, style.link)}>Sign In</div>
    </a>
  );

  function isLoggedIn(): JSX.Element {
    if (user) {
      return <UserMenu user={user} />;
    } else {
      return signInLink;
    }
  }

  const rightEdge = isLoggedIn();

  return (
    <div className={style.bar}>
      <div className={style.left}>
        <div className={style.logo}>ASPEN</div>
        {orgSplash}
      </div>

      <div className={style.right}>{rightEdge}</div>
    </div>
  );
};

export default NavBar;
