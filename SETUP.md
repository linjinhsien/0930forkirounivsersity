# Azure AZ-900 Card Clash Engine - Setup Guide

## Project Setup & Development Guide

This document confirms the completion of Task 1: Initialize Vue 3 + Vite project with TypeScript strict mode.

### Completed Sub-tasks

#### 1. ✅ Set up Vite project with Vue 3, TypeScript 5.0+, strict mode enabled

**Configuration:**
- Vue 3.5.x installed
- TypeScript 5.9.x installed
- Vite 6.x installed
- TypeScript strict mode enabled in `tsconfig.json`

**Files:**
- `package.json` - Dependencies configured
- `tsconfig.json` - TypeScript configuration with `"strict": true`
- `vite.config.ts` - Vite configuration with Vue plugin

#### 2. ✅ Configure absolute path aliases (`@/` → `src/`)

**Configuration:**
Path aliases are configured in both TypeScript and Vite:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// vite.config.ts
{
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}
```

#### 3. ✅ Install and configure ESLint, Prettier, and pre-commit hooks

**ESLint Configuration (`.eslintrc.cjs`):**
- Enforces TypeScript best practices
- Prohibits `any` type usage (`@typescript-eslint/no-explicit-any: 'error'`)
- Enforces Vue 3 Composition API with `<script setup>` syntax
- Integrates with Prettier for consistent formatting

**Prettier Configuration (`.prettierrc`):**
- Single quotes, no semicolons
- 100 character line width
- ES5 trailing commas
- LF line endings

**Pre-commit Hook (`.git/hooks/pre-commit`):**
The pre-commit hook automatically runs:
1. ESLint on staged `.vue`, `.ts`, `.tsx`, `.js`, `.jsx` files
2. Prettier check (auto-formats if needed)
3. TypeScript type check (`vue-tsc --noEmit`)

All checks must pass before commit succeeds.

#### 4. ✅ Create `.env` templates for development/production

**Files Created:**
- `.env` - Development environment variables
- `.env.production` - Production environment variables

**Environment Variables:**
```env
VITE_APP_NAME=Azure AZ-900 Card Clash
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development|production
VITE_DEFAULT_LOCALE=en
VITE_FALLBACK_LOCALE=en
VITE_SESSION_EXPIRY_DAYS=7
```

### Project Structure

```
azure-az900-card-clash/
├── .git/
│   └── hooks/
│       └── pre-commit          # Pre-commit validation hook
├── src/
│   └── styles/
│       └── main.css           # Tailwind CSS entry point
├── scripts/
│   └── verify-setup.js        # Setup verification script
├── .env                       # Development environment config
├── .env.production            # Production environment config
├── .eslintrc.cjs             # ESLint configuration
├── .prettierrc               # Prettier configuration
├── index.html                # HTML entry point
├── package.json              # Project dependencies
├── playwright.config.ts      # E2E testing configuration
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── SETUP.md                  # This file
```

### Development Workflow

#### Install Dependencies
```bash
npm install
```

#### Run Development Server
```bash
npm run dev
```

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

#### Lint Code
```bash
npm run lint
```

#### Format Code
```bash
npm run format
```

#### Verify Setup
```bash
node scripts/verify-setup.js
```

### TypeScript Strict Mode Rules

The project enforces TypeScript strict mode with the following rules:
- ✅ `strict: true` - All strict checks enabled
- ✅ `noUnusedLocals: true` - Prevent unused local variables
- ✅ `noUnusedParameters: true` - Prevent unused function parameters
- ✅ `noFallthroughCasesInSwitch: true` - Prevent switch fallthrough
- ✅ `@typescript-eslint/no-explicit-any: 'error'` - Prohibit `any` type

### Key Dependencies

**Core Framework:**
- `vue@^3.5.13` - Progressive JavaScript framework
- `vue-router@^4.6.4` - Official Vue.js router
- `pinia@^4.0.3` - Vue state management
- `vue-i18n@^11.4.2` - Internationalization plugin
- `@vueuse/core@^11.3.0` - Vue composition utilities

**Development Tools:**
- `vite@^6.0.7` - Next-generation frontend tooling
- `typescript@^5.9.3` - TypeScript compiler
- `eslint@^8.57.0` - Linting utility
- `prettier@^3.9.9` - Code formatter
- `tailwindcss@^3.4.19` - Utility-first CSS framework

**Testing:**
- `vitest@^4.1.11` - Unit testing framework
- `@testing-library/vue@^8.1.0` - Vue testing utilities
- `@playwright/test@^1.63.0` - E2E testing framework

### Next Steps

With Task 1 complete, the project is ready for:

1. **Task 2**: Configure Tailwind CSS and design tokens
2. **Task 3**: Set up Pinia state management stores
3. **Task 4**: Configure testing frameworks (Vitest, Playwright)
4. **Task 5**: Set up GitHub Actions CI/CD pipeline

### Verification

To verify the setup is complete, run:

```bash
node scripts/verify-setup.js
```

All checks should pass ✅.

### Requirements Satisfied

This setup satisfies the following requirements from the spec:
- **Requirement 8.1**: Keyboard navigation setup (ESLint enforces accessibility)
- **Requirement 8.3**: Internationalization setup (vue-i18n configured)

---

**Setup Status**: ✅ Current
**Date Completed**: 2026-09-30
**Spec**: azure-az900-card-clash-engine


## GitHub Pages Deployment

Production deployment uses GitHub Pages, not Azure Static Web Apps.

- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` or manual workflow dispatch
- Build output: `dist/`
- Pages source: **GitHub Actions**
- Repository base path: `/0930forkirounivsersity/`

No Azure Static Web Apps resource or Azure deployment secret is required.

See [docs/deployment.md](docs/deployment.md) for the complete deployment and troubleshooting guide.
