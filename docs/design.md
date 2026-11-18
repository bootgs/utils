# Design

[← Back to README](../README.md) · [Documentation site](https://bootgs.github.io/utils/)

This page describes how **@bootgs/utils** is organised: its modules and their boundaries, how it uses the Google
Apps Script services, how it is packaged and how the documentation is generated. It describes the code in
[`src/`](../src/) as of version 3.0.x.

The library is a collection of independent functions and exception classes. It has no state, no configuration, no
network listener and no storage of its own, and it makes no network calls (see [Privacy](privacy.md)). Every
function runs inside the caller's Apps Script execution (or in Node.js, for the runtime-independent part) and works
only on the values it is given or the Apps Script service objects it reaches for.

## Modules

`src/index.ts` re-exports every module, so the whole public API is available from the package root. Each module
directory has an `index.ts` barrel that re-exports its files; each public function lives in a file of its own,
named after the function.

| Module              | Contents                                                                                                                                                                                                                                            |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lang/base`         | Type guards for JavaScript values (`isString`, `nonNil`, `requireObject`, …).                                                                                                                                                                       |
| `lang/array`        | Array helpers (`chunk`, `unique`, `transpose`, …) and 2D-array checks used before writing to a sheet.                                                                                                                                               |
| `lang/number`       | Number guards (`isInteger`, `requireSafeInteger`, …).                                                                                                                                                                                               |
| `lang/string`       | String guards and validators (e-mail, locale, slug, version), case conversion, `escapeRegExp`, `merge` (`{{placeholder}}` templates).                                                                                                               |
| `lang/object`       | `getPath`, `setPath`, `equals`, `flat`, `hashCode`, `objectToString`.                                                                                                                                                                               |
| `lang/function`     | `retry`.                                                                                                                                                                                                                                            |
| `lang` (root)       | The `Class` abstract type and the `Iterator` interface.                                                                                                                                                                                             |
| `exception`         | The exception hierarchy: `Exception` extends `Error`, `RuntimeException` extends `Exception`, and every concrete exception extends `RuntimeException`. Service-specific ones are in `exception/appsscript/{admin,sheet,slide}` and `exception/net`. |
| `net/path`          | Path helpers (`join`, `normalize`, `parse`, `isAbsolute`, …) and domain validation.                                                                                                                                                                 |
| `net/url`           | URL guards (`isUrl`, `requireUrl`).                                                                                                                                                                                                                 |
| `json`              | `parseJson`, `stringifyJson`.                                                                                                                                                                                                                       |
| `html`              | `escapeHtml`, `escapeXml`, `encodeHtml`, `decodeHtml`.                                                                                                                                                                                              |
| `time`              | `StopWatch`, `TimeUnit`, `now`, `diff`, `offset`, month helpers.                                                                                                                                                                                    |
| `appsscript/sheet`  | Spreadsheet helpers: A1 notation parsing and building, column letters, `GridRange` comparisons, row and column writes, conditional clear/delete, schemas stored in developer metadata, rich text to HTML.                                           |
| `appsscript/slide`  | Presentation and slide guards, slide lookup, Markdown ↔ rich text conversion, find and replace.                                                                                                                                                     |
| `appsscript/ui`     | Guards for `Ui`, `HtmlOutput` and `TextOutput`; `checkMultipleAccount`.                                                                                                                                                                             |
| `appsscript/admin`  | `isAdmin`, `nonAdmin`, `requireAdmin` (Admin SDK Directory).                                                                                                                                                                                        |
| `appsscript/drive`  | `createFolder`.                                                                                                                                                                                                                                     |
| `appsscript/base`   | `getTriggerById`, `getByteSize`.                                                                                                                                                                                                                    |
| `appsscript/net`    | `requireValidToken` (checks an API key or `Bearer` token against allowed values).                                                                                                                                                                   |
| `appsscript` (root) | `requireService`, `requireRepository` (throw when a service, such as an advanced service, or a repository is not defined).                                                                                                                          |

`appsscript/doc`, `appsscript/form` and `net/emitter` are placeholders and export nothing yet.

Most functions follow one naming scheme — `isX` and `nonX` return a `boolean`, `requireX` and `requireNonX` return
the value or throw — described in [Validation conventions](https://bootgs.github.io/utils/validation-conventions.html).
Which exception each function throws is listed in
[Exception handling](https://bootgs.github.io/utils/exception-handling.html).

### Boundaries

Imports between modules are relative (`../../exception`), never through the package name, and go one way:

- `appsscript/*` packages depend only on `lang` and `exception`, never on each other;
- `net`, `json` and `html` depend on `lang` (and `net` on `exception`); `time` depends on `exception`;
- `lang` and `exception` depend on each other (guards throw exceptions, exceptions use guards), and `lang` uses
  `json` and `net` in a few validators.

Nothing outside `appsscript` refers to an Apps Script global, with one exception: `retry` calls `Utilities.sleep`
when it exists. That split is what lets most of the library run and be tested in Node.js.

## Apps Script services

Functions in `appsscript` either take the service object they work on as an argument (`appendRows(sheet, rows)`,
`requireSheet(value)`) or, for a small, listed set, reach for a global such as `SpreadsheetApp`, `SlidesApp`,
`DriveApp`, `ScriptApp`, `Session`, `LockService` or `AdminDirectory` themselves. The library never calls
`UrlFetchApp`, `PropertiesService` or `CacheService`.

Which functions reach for which global, and the OAuth scope each one needs in `appsscript.json`, are listed on
[The Apps Script runtime](https://bootgs.github.io/utils/apps-script-runtime.html). Apps Script derives scopes from
the code of the whole project, so a project that bundles the library should set `oauthScopes` explicitly; that page
gives the narrowest scope for each function.

## Packaging

- The package is ESM only (`"type": "module"`) with one entry point: `exports["."]` maps to `dist/index.js` and
  `dist/index.d.ts`. `"sideEffects": false` lets bundlers drop unused functions.
- `npm run build` compiles `src/` with `tsc -b` (target `ESNext`) into `dist/` and runs
  [`scripts/fix-esm-specifiers.mjs`](../scripts/fix-esm-specifiers.mjs), which rewrites extensionless relative
  imports to `./file.js` / `./dir/index.js` so `dist/` loads in Node.js without a bundler. No source maps or
  declaration maps are emitted, because `src/` is not shipped.
- The published tarball contains only `dist/`, `NOTICE`, `LICENSE`, `README.md` and `package.json` (`files` in
  `package.json`). `dist/` is not committed.
- Apps Script has no module system, so applications bundle the library with their own code. For the runtime tests
  in [`scripts/gas/`](../scripts/gas/README.md), `npm run build:gas` flattens `dist/` into one script file in
  dependency order.
- Releases are built, tested, packed and published by
  [`release-please.yml`](../.github/workflows/release-please.yml); see
  [Verifying a Release](../SECURITY.md#verifying-a-release).

## Documentation pipeline

The documentation site is built with [Writerside](https://www.jetbrains.com/writerside/) in five languages
(English in `docs/writerside/`, the others in `docs/writerside-<code>/`).

1. **Generate.** [`scripts/docs/generate-topics.mjs`](../scripts/docs/generate-topics.mjs) reads `src/` with the
   TypeScript compiler (signatures, parameter and return types, thrown exceptions, `@since`) and combines it with
   hand-written prose from `docs/content/<language>/` into the reference pages of every language project. The JSDoc
   is only a fallback; [`docs/content/COVERAGE.md`](content/COVERAGE.md) lists pages still using it.
2. **Check.** CI fails when the generated pages are stale (`npm run docs:check`); [`docs.yml`](../.github/workflows/docs.yml)
   additionally verifies the documented examples and the examples and links in the JSDoc.
3. **Build and test.** `docs.yml` builds each language with the Writerside Docker builder and runs the Writerside
   checker on the result.
4. **Publish.** On pushes to `main`, `docs.yml` assembles the languages into one site, adds hreflang links, a
   sitemap and `robots.txt`, restores earlier versions from the `docs-archive` branch and deploys to GitHub Pages
   at <https://bootgs.github.io/utils/>.

The README and its translations in `docs/readme/` are not part of the site; they are checked by
`npm run docs:check-i18n` (see [README Translations](../CONTRIBUTING.md#readme-translations)).
