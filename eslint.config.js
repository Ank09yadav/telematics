// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/no-named-as-default": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-require-imports": "off",
    }
  }
]);
