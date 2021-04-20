import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { defaultTheme } from "czifui";
import React, { FunctionComponent, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import style from "./App.module.scss";
import { fetchUserData } from "./common/api";
import { ROUTES } from "./common/routes";
import Data from "./data";
import Landing from "./Landing";
import NavBar from "./NavBar";

const App: FunctionComponent = () => {
  const [user, setUser] = useState<string | undefined>();
  const [org, setOrg] = useState<string | undefined>();

  useEffect(() => {
    const setUserData = async () => {
      const { group, user } = await fetchUserData();
      setUser(user.name);
      setOrg(group.name);
    };
    setUserData();
  }, []);

  return (
    <Router>
      <StylesProvider injectFirst>
        <ThemeProvider theme={defaultTheme}>
          <EmotionThemeProvider theme={defaultTheme}>
            <div className={style.app}>
              <NavBar org={org} user={user} />
              <div className={style.view}>
                <Switch>
                  <Route path={ROUTES.DATA} component={Data} />
                  <Route path={ROUTES.HOMEPAGE} component={Landing} />
                </Switch>
              </div>
            </div>
          </EmotionThemeProvider>
        </ThemeProvider>
      </StylesProvider>
    </Router>
  );
};

export default App;
