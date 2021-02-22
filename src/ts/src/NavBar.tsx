import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import cx from "classnames";

import { ReactComponent as AspenLogo } from "common/styles/logos/AspenLogo.svg";

import style from "./NavBar.module.scss";

type Props = {
    org: string;
    user: string;
};

const LINKS: Array<Record<string, string>> = [
    { to: "/", text: "Overview"},
    { to: "/data", text: "Data"}
];

const NavBar: FunctionComponent<Props> = ({ org, user }: Props) => {

    const navigationLinks = LINKS.map((link, index) => {
        return (
            <Link to={link.to} key={link.text}>
                <div className={cx(style.item, style.link)}>{link.text}</div>
            </Link>
        )
    })

    return (
        <div className={style.bar}>
            <div className={style.contentArea}>
                <div className={style.left}>
                    <div className={cx(style.item, style.logo)}>
                        <AspenLogo height={"60%"}/>
                    </div>
                    <div className={style.seperator} />
                    <div className={cx(style.item, style.org)}>
                        {org}
                    </div>
                </div>
                <div className={style.center}>
                </div>
                <div className={style.right}>
                    {navigationLinks}
                    <div className={cx(style.item, style.user)}>
                        {user}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NavBar;
