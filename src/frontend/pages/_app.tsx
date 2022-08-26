import { CacheProvider, EmotionCache } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { analyticsRecordRouteChange } from "src/common/analytics/methods";
import { OneTrustInitializer } from "src/common/analytics/OneTrustInitializer";
import { PlausibleInitializer } from "src/common/analytics/PlausibleInitializer";
import { SegmentInitializer } from "src/common/analytics/SegmentInitializer";
import { useAppRouting } from "src/common/appRouting";
import { queryClient } from "src/common/queries/queryClient";
import { store } from "src/common/redux";
import { StyledApp } from "src/common/styles/appStyle";
import "src/common/styles/global.css";
import "src/common/styles/oneTrust.css";
import { theme } from "src/common/styles/theme";
import Nav from "src/components/NavBar";
import SplitInitializer from "src/components/Split";
import createEmotionCache from "src/createEmotionCache";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const App = ({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: MyAppProps): JSX.Element => {
  // (thuang): MUI related SSR setup
  // https://material-ui.com/guides/server-rendering/
  useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  const router = useRouter(); // Used to track page changes for analytics.
  /**
   * Whenever route changes, fire off an analytics event to track page change.
   *
   * In theory, the returned unmount func should be used seldom, because the
   * top-level App should always stay mounted. However, we have outstanding
   * issues with repeated mount/unmounts. See this ticket:
   *   FIXME: https://app.shortcut.com/genepi/story/204578
   *
   * Additionally, when the app loads, the `routeChangeComplete` event fires
   * repeatedly. It's unclear at the moment if it's connected to the above,
   * but that issue is being tracked by this ticket:
   *   FIXME: https://app.shortcut.com/genepi/story/204580
   * As a workaround for the above, we keep track of the route each `page`
   * method call happens on, and then don't fire off another `page` call until
   * the next time it changes.
   */
  useEffect(() => {
    router.events.on("routeChangeComplete", analyticsRecordRouteChange);
    return () => {
      router.events.off("routeChangeComplete", analyticsRecordRouteChange);
    };
  }, [router]);

  /**
   * This code makes sure that groupId and pathogen exist in the url when appropriate
   */
  useAppRouting();

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <PlausibleInitializer />
        <QueryClientProvider client={queryClient}>
          <OneTrustInitializer />
          <SegmentInitializer />
          <SplitInitializer>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <StyledApp>
                <Nav />
                <Component {...pageProps} />
              </StyledApp>
            </ThemeProvider>
          </SplitInitializer>
        </QueryClientProvider>
      </CacheProvider>
    </Provider>
  );
};

export default App;
