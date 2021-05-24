module.exports = {
  coverageDirectory: "<rootDir>/client-coverage",
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/build/"],
  coverageReporters: ["text-summary", "json", "html"],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 40,
      lines: 55,
      statements: 55,
    },
  },
  globals: {},
  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|eot|woff|ttf|otf)$":
      "<rootDir>/jest/mocks/emptyObject.js",
    // (thuang): Since we load SVG as React Components via `@svgr/webpack`
    // we need to mock out all svg files as components
    "\\.(svg)$": "<rootDir>/jest/mocks/svgComponent.js",
  },
  modulePaths: ["<rootDir>/"],
  rootDir: "../",
  setupFilesAfterEnv: ["<rootDir>/jest/setup.ts"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx,scss}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx,scss}",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/build/"],
  transform: {
    "^.+\\.(tsx?|jsx?)$": `<rootDir>/jest/jest-preprocess.js`,
  },
};
