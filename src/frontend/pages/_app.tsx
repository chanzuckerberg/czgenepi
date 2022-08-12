import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { PlausibleInitializer } from "src/common/analytics/PlausibleInitializer";
import { store } from "src/common/redux";
import { StyledApp } from "src/common/styles/appStyle";
import "src/common/styles/global.css";
import { theme } from "src/common/styles/theme";
import { setFeatureFlagsFromQueryParams } from "src/common/utils/featureFlags";
import Nav from "src/components/NavBar";
import SplitInitializer from "src/components/Split";

export const queryClient = new QueryClient();
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
    <Provider store={store}>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <PlausibleInitializer />
      <QueryClientProvider client={queryClient}>
        <SplitInitializer>
          <StylesProvider injectFirst>
            <ThemeProvider theme={theme}>
              <EmotionThemeProvider theme={theme}>
                <StyledApp>
                  <Nav />
                  <Component {...pageProps} />
                </StyledApp>
              </EmotionThemeProvider>
            </ThemeProvider>
          </StylesProvider>
        </SplitInitializer>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
