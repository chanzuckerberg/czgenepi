import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "semantic-ui-css/semantic.min.css";
import style from "src/App.module.scss";
import { useUserInfo } from "src/common/queries/auth";
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
  const { data } = useUserInfo();
  const user = data?.user;
  if (user) {
    return <NavBarLoggedIn />;
  } else {
    return <NavBarLanding />;
  }
}

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
      </QueryClientProvider>
    </>
  );
};

export default App;
