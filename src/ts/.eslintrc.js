module.exports = {
    root: true,
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
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    },
    overrides: [
        {
            files: ["*.d.ts"], // type declaration files
            rules: {
                "@typescript-eslint/triple-slash-reference": "off",
            }
        }
    ]
};
