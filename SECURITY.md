# Security Policy

This document explains which versions of **@bootgs/utils** receive security fixes and how to report a
vulnerability. We appreciate the work of security researchers who help keep the library and its users safe.

## Supported Versions

| Version | Package             | Supported                                                         |
| :------ | :------------------ | :---------------------------------------------------------------- |
| `3.x`   | `@bootgs/utils`     | :white_check_mark: once `3.0.0` is released                       |
| `2.x`   | `apps-script-utils` | :warning: security fixes only, until 3 months after `3.0.0` ships |
| `< 2.0` | `apps-script-utils` | :x:                                                               |

Version 3 is published under the new name `@bootgs/utils`; the `2.x` line was published as `apps-script-utils`.
The latest release receives all fixes. Please upgrade to the latest release to stay protected; see
[SUPPORT.md](SUPPORT.md) for the support policy.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public issues, discussions or pull requests.**

1. **Preferred:** use GitHub private vulnerability reporting — open the repository's
   [**Security** tab → **Report a vulnerability**](https://github.com/bootgs/utils/security/advisories/new).
2. **Alternative:** email [security@maksymstoianov.com](mailto:security@maksymstoianov.com).

Please include:

- a short description and the type of issue (for example injection, prototype pollution, information disclosure);
- the affected versions;
- steps to reproduce or a proof of concept;
- the impact as you understand it, and any suggested fix.

## Response Timeline

| Step                                       | Target                       |
| :----------------------------------------- | :--------------------------- |
| Acknowledgement of the report              | within 5 business days       |
| Initial assessment (validity and severity) | within 14 days               |
| Fix released for critical or high severity | within 30 days of assessment |
| Fix for medium or low severity             | in a regular release         |

We keep you informed of progress and may ask for more details. Severity is rated with
[CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document).

## Coordinated Disclosure

- We follow coordinated vulnerability disclosure: please keep the details private until a fix is released or
  90 days have passed since your report, whichever comes first, unless we agree on another date together.
- Fixes are published as a new release, and confirmed vulnerabilities get a
  [GitHub Security Advisory](https://github.com/bootgs/utils/security/advisories) and, where applicable, a CVE.
- If a report is out of scope or not a vulnerability, we tell you why.

## Credit

With your permission, we credit reporters by name or handle in the security advisory and release notes. Tell us
in your report how you would like to be credited, or if you prefer to stay anonymous. We do not run a paid bug
bounty programme.

## Scope

In scope: the source code in this repository, the `@bootgs/utils` package published on npm and the `2.x` releases
of `apps-script-utils` while they are supported.

Out of scope: vulnerabilities in Google Apps Script itself or other Google services (report them to
[Google](https://bughunters.google.com/)), in development dependencies or other third-party packages (report them
upstream; we will update the dependency), and in scripts built with the library that are caused by their own code
or configuration.

## Verifying a Release

**npm package.** After installing, check the registry signatures (and provenance attestations, where present) of
your dependency tree:

```bash
npm audit signatures
```

The release workflow publishes new versions from GitHub Actions with
[npm provenance](https://docs.npmjs.com/generating-provenance-statements); the provenance shown on
[npmjs.com/package/@bootgs/utils](https://www.npmjs.com/package/@bootgs/utils) names the repository `bootgs/utils`,
the workflow `.github/workflows/release-please.yml` and the commit the version was built from. `3.0.0`, the first
version under the new name, was published by hand and has a registry signature but no npm provenance; its tarball
is the same file as the attested GitHub release asset below (compare `npm view @bootgs/utils@3.0.0 dist.shasum` with
`shasum bootgs-utils-3.0.0.tgz`).

**GitHub release assets.** Releases from `v3.0.0` on carry the npm tarball `bootgs-utils-<version>.tgz` and its
Sigstore build provenance `bootgs-utils-<version>.tgz.sigstore.json`, plus a CycloneDX SBOM of the runtime
dependency tree (`sbom.cdx.json` in `v3.0.0`, `bootgs-utils-<version>.cdx.json` in later releases). Earlier
releases have no assets. Verify a downloaded tarball with the [GitHub CLI](https://cli.github.com/):

```bash
gh attestation verify bootgs-utils-<version>.tgz --repo bootgs/utils \
  --signer-workflow bootgs/utils/.github/workflows/release-please.yml
```

Add `--bundle bootgs-utils-<version>.tgz.sigstore.json` to verify against the downloaded bundle instead of fetching
the attestation from GitHub. The attestation is valid only if it was signed by the `release-please.yml` workflow of
`bootgs/utils`, which runs on pushes to `main` (or a manual run for an existing tag).

## Secrets and Credentials

- No long-lived publishing credential exists: npm publishing uses
  [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) from the `npm` environment.
- No secrets are stored in the repository or its environments. Workflows use only the per-run `GITHUB_TOKEN`, with
  permissions declared per job (`release-please.yml` and `docs.yml` reference `secrets.GITHUB_TOKEN`; no other
  secret is referenced). Codecov uploads authenticate with OIDC.
- If a secret becomes necessary, it is stored only as a GitHub Actions secret scoped to an environment, is
  accessible to maintainers only, and is rotated at least once a year and immediately on suspected exposure.
- GitHub secret scanning and push protection are enabled for the repository.
- Who has access to these resources: [MAINTAINERS.md](MAINTAINERS.md#access-to-sensitive-resources).

## Dependency and Code Scanning Policy

**Software composition analysis (SCA).**
[ci.yml](.github/workflows/ci.yml) runs on every pull request and on pushes to `main` and `develop`:

- `npm audit --omit=dev --audit-level=high` — a high or critical vulnerability in a runtime dependency fails the
  `checks` job;
- the `licences` step — a runtime dependency outside the allow-list (`Apache-2.0`, `MIT`, `BSD-2-Clause`,
  `BSD-3-Clause`, `ISC`, `0BSD`) fails the `checks` job.

`checks` is a required status check for pull requests into `develop`, so either failure blocks merging. Moderate
and low findings are fixed within 30 days or before the next release, whichever comes first, usually through
[Dependabot](.github/dependabot.yml) updates. No release is made while an SCA violation is open.

**Static analysis (SAST).** [CodeQL](.github/workflows/codeql.yml) analyses JavaScript/TypeScript and GitHub Actions
on every pull request and push to `main` and `develop` and weekly; ESLint with `eslint-plugin-security` runs in the
`checks` job. High and critical CodeQL alerts are fixed before merging, medium ones before the next release. A
finding may be dismissed only as a false positive or not exploitable, with the reason written in the alert. CodeQL
is not a required status check; these thresholds are applied through maintainer review of every pull request.

## Security Best Practices for Users

1. **Keep dependencies updated:** use the latest `@bootgs/utils` release and keep other packages current.
2. **Secret management:** never commit API keys or secrets; use `PropertiesService` or another secret store.
3. **Least privilege:** declare only the OAuth scopes you need in `appsscript.json`.
4. **Input validation:** validate input from users, sheets and web requests before acting on it, for example with
   the library's `require*` checks.

---

_Thank you for helping us keep **@bootgs/utils** secure!_
