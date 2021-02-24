import React, { FunctionComponent, useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import axios from "axios";

import Data from "data";

import Landing from "Landing";
import NavBar from "NavBar";

import style from "App.module.scss";


const fetchUserData = async () => {
    const response = await axios.get("/api/usergroup");
    return response.data;
};


const App: FunctionComponent<React.ReactNode> = () => {

    const [user, setUser] = useState();
    const [org, setOrg] = useState();

    useEffect(() => {
        const setUserData = async () => {
            const usergroup = await fetchUserData();
            setUser(usergroup.user.name);
            setOrg(usergroup.group.name);
        };
        setUserData();
    }, []);

    return (
        <Router>
            <div className={style.app}>
                <div className={style.navBar}>
                    <NavBar org={org} user={user}/>
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
