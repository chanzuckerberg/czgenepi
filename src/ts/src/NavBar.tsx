import React from "react";
import { NavBar } from "cz-ui";
import { Link } from "react-router-dom";

import ErrorBoundary from "common/components/ErrorBoundary";

import style from "NavBar.module.scss";

export default function NavBarAspen(): JSX.Element {
    const navLinks = [
        <Link key="home" to="/">
            Overview
        </Link>,
        <Link key="upload" to="/upload">
            Upload
        </Link>,
    ];

    return (
        <div className={style.navbar}>
            <ErrorBoundary>
                <NavBar
                    title={
                        <Link className={style.titleLink} to="/">
                            Aspen?
                        </Link>
                    }
                    navLinks={navLinks}
                />
            </ErrorBoundary>
        </div>
    );
}
