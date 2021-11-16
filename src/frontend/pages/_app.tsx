import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "semantic-ui-css/semantic.min.css";

import style from "src/App.module.scss";
import { theme } from "src/common/styles/theme";
import { setFeatureFlagsFromQueryParams } from "src/common/utils/featureFlags";
import NavBarV2 from "src/components/NavBarV2";
import AcknowledgePolicyChanges from "src/components/AcknowledgePolicyChanges";

const queryClient = new QueryClient();
setFeatureFlagsFromQueryParams();

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
                <NavBarV2 />
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
