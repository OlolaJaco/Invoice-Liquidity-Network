# CI/CD and GitHub Environments

This repository uses GitHub Environments to protect deployment secrets and ensure audit control over network deployments.

## Required environments

Create the following environments in GitHub repository settings:

- `testnet`
  - Secrets:
    - `TESTNET_DEPLOYER_SECRET`
    - `TESTNET_HORIZON_URL`
  - Approval: automatic approval

- `mainnet`
  - Secrets:
    - `MAINNET_DEPLOYER_SECRET`
    - `MAINNET_HORIZON_URL`
  - Approval: require at least 2 maintainers as reviewers

> Environments are configured in GitHub repository settings under `Settings > Environments`.

## Why this matters

Using GitHub Environments ensures that:

- deployment secrets are only available to jobs that explicitly reference the environment
- mainnet deployments require human review before running
- audit trails are preserved for protected release operations

## Deployment workflow

The repository includes a protected deployment workflow at `.github/workflows/deploy.yml`.

The workflow is triggered manually via `workflow_dispatch` and uses the selected environment:

- `testnet` environment for testnet deployments
- `mainnet` environment for mainnet deployments

### How secrets are loaded

The deployment workflow maps the selected network to environment secrets:

- `TESTNET_DEPLOYER_SECRET`
- `TESTNET_HORIZON_URL`
- `MAINNET_DEPLOYER_SECRET`
- `MAINNET_HORIZON_URL`

The workflow also sets `environment: ${{ github.event.inputs.network }}` to ensure GitHub applies the correct environment guard.

## Setup steps

1. Open `Settings > Environments` in the GitHub repository.
2. Create a new environment named `testnet`.
3. Add the required secret values.
4. Configure approval rules for `testnet` to allow automatic approval.
5. Create a new environment named `mainnet`.
6. Add the required secret values.
7. Configure approval rules for `mainnet` and require at least two maintainers as reviewers.
8. Confirm the deployment workflow references the environment in `.github/workflows/deploy.yml`.

## Notes

- Environment settings cannot be committed to the repository; they must be created in the GitHub UI.
- If `mainnet` is selected, GitHub will block the deployment until required reviewers approve the workflow run.

## Turborepo Build Pipeline

Turborepo optimizes and speeds up the build process for this monorepo by caching task outputs and running tasks in parallel.

The 4 pipelines: `build`, `test`, `lint`, `type-check`.

How to enable remote caching with Vercel: run `pnpm dlx turbo login` then `pnpm dlx turbo link`.

Expected cache hit rates:
- First run: 0% (cold cache, everything runs)
- Subsequent runs with no changes: ~90-100% (full cache hit)
- Typical CI runs with partial changes: ~60-80%
- After SDK changes: ~20-40% (most packages depend on SDK)

Environment variables needed for CI remote caching: `TURBO_TOKEN` and `TURBO_TEAM`.
