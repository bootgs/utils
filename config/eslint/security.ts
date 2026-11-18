import security from "eslint-plugin-security";

export default {
  files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  ignores: [
    "src/test/**/*.{js,mjs,cjs,ts,jsx,tsx}",
    "**/*.test.{js,mjs,cjs,ts,jsx,tsx}",
    "**/*.spec.{js,mjs,cjs,ts,jsx,tsx}"
  ],
  plugins: {
    security
  },
  rules: {
    ...security.configs.recommended.rules,

    // Flags every `obj[key]`. The keys here come from code, not from request
    // input, and CodeQL already covers prototype pollution.
    "security/detect-object-injection": "off"
  }
};
