# Maintainers

| Name            | GitHub                                               | Role            |
| :-------------- | :--------------------------------------------------- | :-------------- |
| Maksym Stoianov | [@MaksymStoianov](https://github.com/MaksymStoianov) | Lead maintainer |

## Access to sensitive resources

| Resource                                                                     | Who has access                                                                                                                                                                                                                                                                                        |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub organisation `bootgs` and repository `bootgs/utils`                   | Owner/admin: @MaksymStoianov                                                                                                                                                                                                                                                                          |
| npm package `@bootgs/utils` (publishing)                                     | npm account `maksymstoianov` (@MaksymStoianov), the only maintainer on the registry. CI publishes with npm trusted publishing (OIDC) from the `publish` job of `release-please.yml` in the environment `npm`, which deploys only from `main`; no npm token is stored in GitHub                        |
| GitHub Actions secrets                                                       | None are stored in the repository or its environments. Workflows use only the per-run `GITHUB_TOKEN` (`release-please.yml` passes it to release-please and to `gh release upload`, `docs.yml` uses it to push the `docs-archive` branch), with permissions declared per job; Codecov uploads use OIDC |
| Documentation site [bootgs.github.io/utils](https://bootgs.github.io/utils/) | Deployed by `docs.yml` through GitHub Pages in the environment `github-pages`, which deploys only from `main`; repository admins                                                                                                                                                                      |
| Security advisories and private vulnerability reports                        | Maintainers listed above (repository admins)                                                                                                                                                                                                                                                          |
| Emergency access to the organisation and the npm package                     | A trusted backup person, only to keep the project available (see [Continuity](GOVERNANCE.md#continuity))                                                                                                                                                                                              |

Access is granted and reviewed as described in [GOVERNANCE.md](GOVERNANCE.md#becoming-a-maintainer).

See [GOVERNANCE.md](GOVERNANCE.md) for how decisions are made and how to become a maintainer.
