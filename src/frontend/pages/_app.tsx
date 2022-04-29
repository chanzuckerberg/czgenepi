import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "semantic-ui-css/semantic.min.css";
import style from "src/App.module.scss";
import { ROUTES } from "src/common/routes";
import { theme } from "src/common/styles/theme";
import { setFeatureFlagsFromQueryParams } from "src/common/utils/featureFlags";
import NavBarLoggedIn from "src/components/NavBar";
import NavBarLanding from "src/components/NavBarV2";
import { SegmentInitializer } from "src/common/analytics/SegmentInitializer";
import SplitInitializer from "src/components/Split";

const queryClient = new QueryClient();
setFeatureFlagsFromQueryParams();

function Nav(): JSX.Element {
  const router = useRouter();
  return router.asPath === ROUTES.HOMEPAGE ? (
    <NavBarLanding />
  ) : (
    <NavBarLoggedIn />
  );
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
      <SegmentInitializer />
      <QueryClientProvider client={queryClient}>
        <SplitInitializer>
          <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
              <EmotionThemeProvider theme={theme}>
                <div className={style.app}>
                  <Nav />
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
