import React from "react";
import { NavBar } from "cz-ui";
import { Link } from "react-router-dom";

import ErrorBoundary from "common/components/ErrorBoundary";

import style from "NavBar.module.scss";

export default function NavBarCovidr(): JSX.Element {
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
                    accent
                    className={style.navbar}
                    title={
                        <Link className={style.titleLink} to="/">
                            COVIDr?
                        </Link>
                    }
                    navLinks={navLinks}
                />
            </ErrorBoundary>
        </div>
    );
}
