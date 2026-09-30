# GitHub Actions CI/CD Workflows

This directory contains the CI/CD workflows for the Azure AZ-900 Card Clash Engine project.

## Workflows

### 1. CI Pipeline (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Pipeline Stages:**

1. **Lint** - Code quality checks
   - ESLint for JavaScript/TypeScript/Vue
   - Prettier formatting validation

2. **Type Check** - TypeScript validation
   - Ensures type safety across the codebase
   - Catches type errors before runtime

3. **Test** - Automated testing
   - Unit tests with Vitest
   - E2E tests with Playwright
   - Test coverage reporting to Codecov

4. **Build** - Production build verification
   - Creates optimized production bundle
   - Validates build configuration
   - Uploads build artifacts for review

5. **Security Scan** - Dependency vulnerability checks
   - npm audit for known vulnerabilities
   - Snyk security scanning (optional)

**Status Checks:**
All jobs must pass before merging to main branch.

### 2. Azure Static Web Apps Deploy (`azure-static-web-apps.yml`)

Automatically deploys the application to Azure Static Web Apps on push to `main` branch.

**Deployment Process:**

1. **Build Phase:**
   - Install dependencies
   - Run linting and type checking
   - Run unit tests
   - Build production bundle

2. **Deploy Phase:**
   - Upload to Azure Static Web Apps
   - Configure routing and fallback
   - Enable preview deployments for PRs

3. **Cleanup:**
   - Remove staging environments when PRs close

## Required Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### Azure Static Web Apps

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: 
  - Get from Azure Portal when creating Static Web App
  - Navigate to: Static Web App → Overview → Manage deployment token
  
- `VITE_API_URL` (optional):
  - API endpoint URL if using backend services
  - Example: `https://api.yourapp.com`

### Optional Secrets

- `SNYK_TOKEN`:
  - For Snyk security scanning
  - Get from https://snyk.io/account/
  - Remove `security-scan` job if not using Snyk

- `CODECOV_TOKEN`:
  - For test coverage reporting
  - Get from https://codecov.io/
  - Optional - works without token for public repos

## Setting Up Azure Static Web Apps

### Prerequisites

1. Azure account with active subscription
2. Azure CLI installed locally (optional)

### Deployment Steps

#### Option 1: Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Create new resource → Static Web Apps
3. Configure:
   - **Name**: `azure-az900-card-clash`
   - **Region**: Choose closest to users
   - **Source**: GitHub
   - **Organization**: Your GitHub username/org
   - **Repository**: This repository
   - **Branch**: main
   - **Build preset**: Vue
   - **App location**: `/`
   - **Output location**: `dist`
4. Click "Review + Create"
5. Copy the deployment token and add to GitHub secrets

#### Option 2: Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name rg-az900-card-clash \
  --location eastus

# Create Static Web App
az staticwebapp create \
  --name azure-az900-card-clash \
  --resource-group rg-az900-card-clash \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

# Get deployment token
az staticwebapp secrets list \
  --name azure-az900-card-clash \
  --resource-group rg-az900-card-clash
```

### Post-Deployment Configuration

1. **Custom Domain** (optional):
   - Go to Static Web App → Custom domains
   - Add your domain and configure DNS

2. **Authentication**:
   - Built-in authentication providers available
   - Configure in Azure Portal if needed

3. **Environment Variables**:
   - Go to Static Web App → Configuration
   - Add environment variables for runtime config

## Local Testing

Test the workflows locally before pushing:

### Install act (GitHub Actions local runner)

```bash
# macOS
brew install act

# Linux/WSL
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Windows (with Chocolatey)
choco install act-cli
```

### Run workflows locally

```bash
# Test CI workflow
act push -W .github/workflows/ci.yml

# Test specific job
act push -j lint -W .github/workflows/ci.yml

# Test with secrets
act push --secret-file .env.local
```

## Troubleshooting

### Build Failures

**Issue**: Type check fails
- **Solution**: Run `npm run type-check` locally to identify type errors

**Issue**: Tests fail on CI but pass locally
- **Solution**: Ensure test environment variables are set in workflow

**Issue**: Build size too large
- **Solution**: Check bundle analyzer and optimize imports

### Deployment Failures

**Issue**: Azure deployment token invalid
- **Solution**: Regenerate token in Azure Portal and update GitHub secret

**Issue**: Application not loading after deployment
- **Solution**: Check Azure Static Web Apps logs in Azure Portal

**Issue**: 404 on page refresh
- **Solution**: Ensure `routes.json` or fallback configuration is correct

### Security Scan Issues

**Issue**: npm audit fails with high severity
- **Solution**: Update dependencies or add exceptions

**Issue**: Snyk scan fails
- **Solution**: Verify SNYK_TOKEN is set correctly

## Performance Optimization

### Build Time

- **Cache node_modules**: Uses `actions/setup-node@v4` with npm cache
- **Parallel jobs**: Lint, type-check, and test run independently
- **Conditional jobs**: Security scan runs in parallel, doesn't block deployment

### Deployment Time

- **Skip duplicate builds**: Azure workflow uses `skip_app_build: true`
- **Incremental deployments**: Only changed files uploaded
- **CDN caching**: Static assets cached globally

## Monitoring

### GitHub Actions

- View workflow runs: Repository → Actions tab
- Failed jobs show detailed logs
- Artifacts available for 7 days after run

### Azure Static Web Apps

- **Metrics**: Portal → Static Web App → Metrics
- **Logs**: Portal → Static Web App → Application Insights
- **Traffic**: Portal → Static Web App → Analytics

## Best Practices

1. **Branch Protection**:
   - Require CI checks to pass before merge
   - Require code review for main branch
   - Enable status checks

2. **Security**:
   - Regularly update dependencies
   - Review security scan results
   - Rotate deployment tokens periodically

3. **Testing**:
   - Maintain >80% code coverage
   - Test critical user paths with E2E tests
   - Run tests locally before pushing

4. **Deployment**:
   - Use preview deployments for PRs
   - Test staging environment before production
   - Monitor application after deployment

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
