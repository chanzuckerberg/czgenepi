module.exports = {
  root: true,
  // extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
  // formatter: require.resolve('react-dev-utils/eslintFormatter'),
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  settings: {
    react: {
      version: "detect",
    }
  },
  rules: {
    "max-len": ["error", {
      code: 120,
    }],
    "max-warnings": 0,
  }
};
