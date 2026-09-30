# Azure AZ-900 Card Clash Engine

An interactive, educational card game that teaches Microsoft Azure fundamentals through scenario-driven gameplay. Built with Vue 3, TypeScript, and Tailwind CSS.

## 🎮 About

Azure AZ-900 Card Clash Engine is a web-based game where players deploy Azure Service Cards to solve architectural challenges while learning AZ-900 certification concepts. The system validates solutions against Azure best practices and provides immediate feedback.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm 10+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testing
```bash
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests
```

### Code Quality
```bash
npm run lint        # Run ESLint
npm run format      # Run Prettier
```

## 📁 Project Structure

```
src/
├── components/      # Vue components
├── engine/          # Game logic engines
├── stores/          # Pinia state stores
├── types/           # TypeScript definitions
├── utils/           # Utility functions
├── views/           # Page views
└── styles/          # Global styles
```

## 🛠 Tech Stack

- **Framework**: Vue 3.5+ with Composition API
- **Language**: TypeScript 5.9+ (strict mode)
- **Build Tool**: Vite 6+
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright
- **i18n**: Vue I18n

## 📚 Documentation

- [Setup Guide](SETUP.md) - Complete setup verification
- [Design Document](.kiro/specs/azure-az900-card-clash-engine/design.md)
- [Requirements](.kiro/specs/azure-az900-card-clash-engine/requirements.md)
- [Tasks](.kiro/specs/azure-az900-card-clash-engine/tasks.md)

## ✅ Task 1 Status: Complete

The project foundation is fully initialized:
- ✅ Vue 3 + Vite + TypeScript strict mode
- ✅ Path aliases (`@/` → `src/`)
- ✅ ESLint + Prettier + Pre-commit hooks
- ✅ Environment configuration files

Run verification:
```bash
node scripts/verify-setup.js
```

## 📄 License

ISC
