import React, { FunctionComponent, useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { fetchUserData } from "common/api";

import Data from "data";
import Landing from "Landing";
import NavBar from "NavBar";

import style from "App.module.scss";

const App: FunctionComponent = () => {
    const [user, setUser] = useState<string | undefined>();
    const [org, setOrg] = useState<string | undefined>();

    useEffect(() => {
        const setUserData = async () => {
            const response = await fetchUserData();
            setUser(response.user.name);
            setOrg(response.group.name);
        };
        setUserData();
    }, []);

    return (
        <Router>
            <div className={style.app}>
                <div className={style.navBar}>
                    <NavBar org={org} user={user} />
                </div>
                <div className={style.view}>
                    <Switch>
                        <Route path="/data" render={() => <Data />} />
                        <Route path="/" render={() => <Landing />} />
                    </Switch>
                </div>
            </div>
        </Router>
    );
};

export default App;
