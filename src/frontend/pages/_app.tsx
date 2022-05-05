import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "semantic-ui-css/semantic.min.css";
import { OneTrustInitializer } from "src/common/analytics/OneTrustInitializer";
import { SegmentInitializer } from "src/common/analytics/SegmentInitializer";
import { ROUTES } from "src/common/routes";
import { StyledApp } from "src/common/styles/appStyle";
import { theme } from "src/common/styles/theme";
import { setFeatureFlagsFromQueryParams } from "src/common/utils/featureFlags";
import NavBarLoggedIn from "src/components/NavBar";
import NavBarLanding from "src/components/NavBarV2";
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

  // TODO [Vince]: Move somewhere permanent, very ugly smushing in right now
  const OneTrustSettingsOpener = () => {
    return (
      <a href="#" className="optanon-show-settings">
        Cookie Settings
      </a>
    );
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <OneTrustInitializer />
      <SegmentInitializer />
      <QueryClientProvider client={queryClient}>
        <SplitInitializer>
          <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
              <EmotionThemeProvider theme={theme}>
                <StyledApp>
                  <Nav />
                  <OneTrustSettingsOpener />
                  <Component {...pageProps} />
                </StyledApp>
              </EmotionThemeProvider>
            </ThemeProvider>
          </StylesProvider>
        </SplitInitializer>
      </QueryClientProvider>
    </>
  );
};

export default App;
