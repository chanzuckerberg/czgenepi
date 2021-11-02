
const nodeEnv = require(__dirname + "/src/common/constants/nodeEnv.js");
const ENV = require(__dirname + "/src/common/constants/ENV.js");
const webpack = require("webpack");

const { createSecureHeaders } = require("next-secure-headers");

const isProdBuild = ENV.NODE_ENV === nodeEnv.PRODUCTION;

const SCRIPT_SRC = ["'self'"];

module.exports = ({
  distDir: ENV.BUILD_PATH,
  fileExtensions: ["jpg", "jpeg", "png", "gif", "ico", "webp", "jp2", "avif"],

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
