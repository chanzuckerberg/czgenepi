import createEmotionServer from "@emotion/server/create-instance";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { theme } from "../src/common/styles/theme";
import createEmotionCache from "../src/createEmotionCache";

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="preconnect" href="https://fonts.gstatic.com" />

          {/* Social media / SEO headers */}
          <meta
            name="description"
            content="CZ GEN EPI is a free, open-source, no-code genomic epidemiology analysis platform for local public health departments to discover, track and stop outbreaks."
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Chan Zuckerberg GEN EPI" />
          <meta property="og:url" content="https://czgenepi.org/" />
          <meta
            property="og:description"
            content="A genomic epidemiology analysis platform for public health departments to discover, track and stop outbreaks"
          />
          <meta
            property="og:image"
            content="https://czgenepi.org/cz-gen-epi-meta.png"
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Chan Zuckerberg GEN EPI" />
          <meta
            name="twitter:description"
            content="A genomic epidemiology analysis platform for public health departments to discover, track and stop outbreaks"
          />
          <meta
            name="twitter:image"
            content="https://czgenepi.org/cz-gen-epi-meta.png"
          />

          {/* TODO Make this load async to fix render blocking */}
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same Emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);

  const emotionStyleTags = emotionStyles.styles.map(
    (style: { key: string; ids: Array<string>; css: string }) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
        key={`${style.key}-${style.ids.join("-")}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    )
  );

  return {
    ...initialProps,
    styles: [
      <>
        {initialProps.styles}
        {emotionStyleTags}
      </>,
    ],
  };
};
