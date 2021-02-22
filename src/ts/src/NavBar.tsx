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
    { to: "/", text: "Overview"},
    { to: "/data", text: "Data"}
];

const DROPDOWN_LINKS: Array<Record<string, string>> = [
    { to: "/contact_us", text: "Contact Us" },
    { to: "/terms", text: "Terms of Use" },
    { to: "/privacy", text: "Privacy Policy" },
    { to: "/logout", text: "Logout" }
]

const NavBar: FunctionComponent<Props> = ({ org, user }) => {

    const navigationLinks = LINKS.map(link => {
        return (
            <Link to={link.to} key={link.text}>
                <div className={cx(style.item, style.link)}>{link.text}</div>
            </Link>
        )
    })

    const dropdownLinks = DROPDOWN_LINKS.map(link => {
        return (
            <Link to={link.to} key={link.text}>
                <Dropdown.Item className={style.dropdownLink} text={link.text} />
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
                        <Dropdown text={user} floating direction={"left"}>
                            <Dropdown.Menu className={style.dropdownMenu}>
                                {dropdownLinks}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NavBar;
