# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing and deployment.

## Frontend Tests (`test-frontend.yml`)

### Purpose
Automatically runs frontend tests and builds on every push or pull request to ensure code quality and prevent regressions.

### When it runs
- **Push to main**: When changes are pushed to the main branch
- **Pull requests**: When PRs are created or updated targeting main branch
- **Path filtering**: Only runs when files in `web/` directory or this workflow file are changed

### What it does
1. **Setup**: Installs Node.js 18 and caches npm dependencies
2. **Install**: Runs `npm ci` to install exact dependency versions
3. **Test**: Runs `npm run test:coverage` to execute all tests with coverage reporting
4. **Build**: Runs `npm run build` to ensure production build works
5. **Upload**: Saves test coverage reports as artifacts (available for 30 days)

### View Results
- **Status**: Check the ✅ or ❌ next to commits and PRs
- **Details**: Click on the workflow run to see detailed logs
- **Coverage**: Download coverage artifacts from the workflow run page

### Local Testing
Before pushing, you can run the same commands locally:

```bash
cd web
npm ci
npm run test:coverage
npm run build
```

### Troubleshooting
- If tests fail, check the "Run tests with coverage" step in the workflow logs
- Coverage reports show which files/lines aren't tested
- Build failures appear in the "Build project" step

### Adding More Workflows
To add additional workflows (e.g., for backend testing), create new `.yml` files in this directory following the same pattern.