/**
 * Overrides for the maintenance scripts under `scripts/` and the authoring
 * inputs they load from `docs/` (`docs/content/authored/*.mjs`).
 *
 * These are build and integration-test files rather than library sources:
 * they are plain JavaScript, they run on a console, and the Apps Script ones
 * reach for the library through the shared global scope.
 */
export default {
  files: ["scripts/**/*.{js,mjs,cjs}", "docs/**/*.{js,mjs,cjs}"],
  rules: {
    // A build script reports its progress; that is its interface.
    "no-console": "off",

    // Return types belong to the TypeScript sources.
    "@typescript-eslint/explicit-function-return-type": "off",

    // A bundler exists to read and write computed paths.
    "security/detect-non-literal-fs-filename": "off",

    // The patterns parse repository sources and are built from constants
    // in these files, never from outside input.
    "security/detect-unsafe-regex": "off",
    "security/detect-non-literal-regexp": "off",

    // The lookups here are into objects these files declare themselves.
    "security/detect-object-injection": "off"
  }
};
