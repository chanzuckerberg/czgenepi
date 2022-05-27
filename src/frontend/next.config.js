const nodeEnv = require(__dirname + "/src/common/constants/nodeEnv.js");
const ENV = require(__dirname + "/src/common/constants/ENV.js");
const webpack = require("webpack");

const { createSecureHeaders } = require("next-secure-headers");

const isProdBuild = ENV.NODE_ENV === nodeEnv.PRODUCTION;

const SCRIPT_SRC = ["'self'", "https://cdn.cookielaw.org", "https://cdn.segment.com"];

module.exports = {
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
                "auth.split.io",
                "sdk.split.io",
                "events.split.io",
                "streaming.split.io",
                "https://cdn.cookielaw.org",
                "https://geolocation.onetrust.com",
                "https://cookies-data.onetrust.io",
                "https://cdn.segment.com",
                "https://api.segment.io",
                ENV.API_URL,
              ],
              defaultSrc: ["'self'"],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              formAction: "'self'",
              frameAncestors: ["'none'"],
              frameSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "https://cdn.cookielaw.org"],
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

  async redirects() {
    return [
      {
        source: "/security.txt",
        destination: "/.well-known/security.txt",
        permanent: true,
      },
    ];
  },

  webpack(config) {
    // use the default svgr config to load most svg
    config.module.rules.push({
      test: /\.svg$/,
      exclude: /landingv2-hero\.svg$/,
      use: ["@svgr/webpack"],
    });

    // except for the hero image, which requires specific config
    // to enable the animation aspect to work
    config.module.rules.push({
      test: /landingv2-hero\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  prefixIds: {
                    prefix: false,
                  },
                  removeHiddenElems: {
                    opacity0: false,
                  },
                },
              ],
            },
          },
        },
      ],
    });

    config.plugins.push(new webpack.EnvironmentPlugin(ENV));

    return config;
  },
};
