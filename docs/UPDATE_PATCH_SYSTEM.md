# Update & Patch System

## Windows updater

**UniverseUpdater.exe** downloads the current `main` branch archive from the GitHub repository, stages it, validates required files, backs up the current installation, replaces the application, and retains the backup for rollback.

### Update sequence
1. Download repository ZIP.
2. Save ZIP under `.universe-updater`.
3. Extract into staging.
4. Validate required repository files.
5. Back up the current installation.
6. Replace it with the staged repository.
7. Retain the backup for rollback.
8. Log the operation.
9. Restore the previous installation if replacement fails.

The updater never replaces the installation before extraction and basic validation succeed.

## Build

`npm run build:updater`

The output is a self-contained Windows x64 single-file `UniverseUpdater.exe`.

## Complete administration suite

`npm run build:admin-suite`

Builds both `UniverseUpdater.exe` and `UniverseAdminTerminal.exe`.

## Patch manifests

- `version.json` — application/version metadata.
- `update-manifest.json` — stable update channel and repository archive information.

No credentials or secrets are stored in these manifests.

## GitHub Actions

`.github/workflows/build-update-suite.yml` builds both Windows executables and packages `Universe-Admin-Update-Suite.zip` as a GitHub Actions artifact.

## Deployment safety

The updater updates application files from the repository. Keep `.env`, PostgreSQL data, uploaded user content, logs, and other mutable production state outside the repository installation directory.
