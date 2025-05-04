import baseConfig, { restrictEnvAccess } from "@sassy/eslint-config/base";
import nextjsConfig from "@sassy/eslint-config/nextjs";
import reactConfig from "@sassy/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
