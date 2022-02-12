import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { SplitFactory, SplitIO } from "@splitsoftware/splitio-react";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "semantic-ui-css/semantic.min.css";
import style from "src/App.module.scss";
import ENV from "src/common/constants/ENV";
import { useUserData, useUserInfo } from "src/common/queries/auth";
import { theme } from "src/common/styles/theme";
import { setFeatureFlagsFromQueryParams } from "src/common/utils/featureFlags";
import AcknowledgePolicyChanges from "src/components/AcknowledgePolicyChanges";
import NavBarLoggedIn from "src/components/NavBar";
import NavBarLanding from "src/components/NavBarV2";

const queryClient = new QueryClient();
setFeatureFlagsFromQueryParams();

function Nav(): JSX.Element {
  // TODO: replace this with common nav
  // this is a workaround while we figure out what the specs are of logged in vs. landing page navbar
  const { data: userInfo } = useUserInfo();
  if (userInfo) {
    return <NavBarLoggedIn />;
  } else {
    return <NavBarLanding />;
  }
}

interface Props {
  children: React.ReactElement;
}
const SplitInitializer = ({ children }: Props): JSX.Element | null => {
  const { data: userData, isLoading: isLoadingUserInfo } = useUserData();
  const [splitConfig, setSplitConfig] = useState(null);

  useEffect(() => {
    // Don't do any work until we've fetched userData
    if (isLoadingUserInfo) {
      return;
    }
    const splitConf: SplitIO.IBrowserSettings = {
      core: {
        authorizationKey: ENV.SPLIT_FRONTEND_KEY,
        key: userData?.id || "anonymous",
      },
    };
    setSplitConfig(splitConf);
  }, [isLoadingUserInfo, userData]);

  if (!splitConfig) {
    // If we haven't fetched a userinfo response yet, don't enable split.
    return <>{children}</>;
  }

  return <SplitFactory config={splitConfig}>{children}</SplitFactory>;
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  // (thuang): MUI related SSR setup
  // https://material-ui.com/guides/server-rendering/
  useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SplitInitializer>
          <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
              <EmotionThemeProvider theme={theme}>
                <div className={style.app}>
                  <Nav />
                  <AcknowledgePolicyChanges />
                  <Component {...pageProps} />
                </div>
              </EmotionThemeProvider>
            </ThemeProvider>
          </StylesProvider>
        </SplitInitializer>
      </QueryClientProvider>
    </>
  );
};

export default App;
