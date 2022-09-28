module.exports = {
  plugins: ["@emotion", transformImports()],
  presets: ["next/babel"],
  env: {
    production: {
      plugins: [
        "babel-plugin-jsx-remove-data-test-id",
        {
          attributes: ["data-test-id", "data-testid"],
        },
      ],
    },
  },
};

function transformImports() {
  const materialUIPackages = ["core", "icons", "lab", "styles"];

  const transform = {};

  for (const package of materialUIPackages) {
    transform["@material-ui/" + package] = {
      preventFullImport: true,
      transform: `@material-ui/${package}/` + "${member}",
    };
  }

  return ["babel-plugin-transform-imports", transform];
}
