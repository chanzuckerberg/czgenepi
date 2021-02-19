import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CZUI } from "cz-ui";

import Landing from "Landing";
import NavBar from "NavBar";

import "App.scss";

export default function App(): JSX.Element {
    return (
        <Router>
            <div className="App">
                <CZUI>
                    <NavBar />
                    <Switch>
                        <Route path="/" render={() => <Landing />} />
                    </Switch>
                </CZUI>
            </div>
        </Router>
    );
}
