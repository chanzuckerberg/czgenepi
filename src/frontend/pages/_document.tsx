import { ServerStyleSheets } from "@mui/styles";
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import React from "react";
import { theme } from "../src/common/styles/theme";

export default class MyDocument extends Document {
  static async getInitialProps(
    context: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheets = new ServerStyleSheets();
    const originalRenderPage = context.renderPage;

    context.renderPage = () =>
      originalRenderPage({
        // eslint-disable-next-line react/display-name
        enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(context);

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [
        ...React.Children.toArray(initialProps.styles),
        sheets.getStyleElement(),
      ],
    };
  }

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
