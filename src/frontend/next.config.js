// This file sets a custom webpack configuration to use our Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

const withImages = require("next-images");

const nodeEnv = require(__dirname + "/src/common/constants/nodeEnv.js");
const ENV = require(__dirname + "/src/common/constants/ENV.js");
const webpack = require("webpack");

const { createSecureHeaders } = require("next-secure-headers");

const isProdBuild = ["staging", "prod"].includes(process.env.DEPLOYMENT_STAGE);

const SCRIPT_SRC = ["'self'"];

const moduleExports = withImages({
  distDir: ENV.BUILD_PATH,
  fileExtensions: ["jpg", "jpeg", "png", "gif", "ico", "webp", "jp2", "avif"],
  future: { webpack5: true },

  async generateBuildId() {
    // Return null to allow next.js to fallback to default behavior
    // if COMMIT_SHA env is missing or empty.
    return ENV.COMMIT_SHA || null;
  },

  headers() {
    return [
      {
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              baseUri: "'self'",
              connectSrc: [
                "'self'",
                "sentry.prod.si.czi.technology",
                ENV.API_URL,
              ],
              defaultSrc: ["'self'"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              formAction: "'self'",
              frameAncestors: ["'none'"],
              frameSrc: ["'self'"],
              imgSrc: ["'self'", "data:"],
              manifestSrc: ["'self'"],
              mediaSrc: ["'self'"],
              objectSrc: ["'none'"],
              scriptSrc: isProdBuild
                ? SCRIPT_SRC
                : [...SCRIPT_SRC, "'unsafe-eval'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              upgradeInsecureRequests: true,
              workerSrc: ["'self'", "blob:"],
            },
          },
        }),
        source: "/(.*)",
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.plugins.push(new webpack.EnvironmentPlugin(ENV));

    return config;
  },
});

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  silent: !isProdBuild

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that our source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions)
