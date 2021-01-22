import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CZUI } from "cz-ui";

import Upload from "upload";

import NavBar from "NavBar";

import "App.scss";

export default function App(): JSX.Element {
    return (
        <Router>
            <div className="App">
                <CZUI>
                    <NavBar />
                    <Switch>
                        <Route path="/upload">
                            <Upload />
                        </Route>
                    </Switch>
                </CZUI>
            </div>
        </Router>
    );
}
