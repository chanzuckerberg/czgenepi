import React, { FunctionComponent } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Landing from "Landing";
import NavBar from "NavBar";

import style from "App.module.scss";

const App: FunctionComponent<React.ReactNode> = () => {
    return (
        <Router>
            <div className={style.app}>
                <div className={style.navBar}>
                    <NavBar />
                </div>
                <div className={style.view}>
                    <Switch>
                        <Route path="/" render={() => <Landing />} />
                    </Switch>
                </div>
            </div>
        </Router>
    );
};

export default App;
