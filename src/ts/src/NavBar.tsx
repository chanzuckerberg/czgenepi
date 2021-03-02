import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import cx from "classnames";

import { ReactComponent as AspenLogo } from "common/styles/logos/AspenLogo.svg";

import style from "./NavBar.module.scss";

type Props = {
    org?: string;
    user?: string;
};

const LINKS: Array<Record<string, string>> = [
    { to: "/", text: "Overview" },
    { to: "/data", text: "Data" },
];

const DROPDOWN_LINKS: Array<Record<string, string>> = [
    { to: "/contact_us", text: "Contact Us" },
    { to: "/terms", text: "Terms of Use" },
    { to: "/privacy", text: "Privacy Policy" },
    { to: "/logout", text: "Logout" },
];

const NavBar: FunctionComponent<Props> = ({ org, user }: Props) => {
    const navigationLinks = LINKS.map((link) => {
        return (
            <Link to={link.to} key={link.text}>
                <div className={cx(style.item, style.link)}>{link.text}</div>
            </Link>
        );
    });

    const dropdownLinks = DROPDOWN_LINKS.map((link) => {
        return (
            <Link to={link.to} key={link.text}>
                <Dropdown.Item
                    className={style.dropdownLink}
                    text={link.text}
                />
            </Link>
        );
    });

    const orgElements = (
        <React.Fragment>
            <div className={style.seperator} />
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

    const userMenu = (
        <div className={cx(style.item, style.user)}>
            <Dropdown text={user} floating direction={"left"}>
                <Dropdown.Menu className={style.dropdownMenu}>
                    {dropdownLinks}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );

    const simpleUserMenu = <div className={style.item}>{user}</div>

    const signInLink = (
        <a href="/login">
            <div className={cx(style.item, style.link)}>Sign In</div>
        </a>
    );

    function isLoggedIn(): JSX.Element {
        if (user === undefined) {
            return signInLink;
        } else {
            return simpleUserMenu;
        }
    }

    const rightEdge = isLoggedIn();

    return (
        <div className={style.bar}>
            <div className={style.contentArea}>
                <div className={style.left}>
                    <div className={cx(style.item, style.logo)}>
                        <AspenLogo height={"60%"} />
                    </div>
                    {orgSplash}
                </div>
                <div className={style.center}></div>
                <div className={style.right}>
                    {rightEdge}
                </div>
            </div>
        </div>
    );
};

export default NavBar;
