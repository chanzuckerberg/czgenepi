import { ContentSecurityPolicyOptions } from "helmet-csp";

export const cspSettings: ContentSecurityPolicyOptions = {
  directives: {
    connectSrc: [
      "'self'",
      "https://sentry.prod.si.czi.technology",
      process.env.API_URL,
    ],
    defaultSrc: ["'self'"],
    fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
    frameSrc: ["'self'"],
    imgSrc: ["'self'", "data:"],
    mediaSrc: ["'self'"],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'"],
    styleSrc: [
      // Allows everything for now to avoid warning flooding console
      "'unsafe-inline'",
      "'self'",
      "https://fonts.googleapis.com",
    ],
  },
  // Specify directives as normal.
  useDefaults: true,
} as ContentSecurityPolicyOptions;
