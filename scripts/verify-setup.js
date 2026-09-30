#!/usr/bin/env node

/**
 * Verification script for Azure AZ-900 Card Clash Engine setup
 * Checks all Task 1 requirements
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

console.log('🔍 Verifying Azure AZ-900 Card Clash Engine Setup...\n')

const checks = []

// Check 1: Vue 3 with TypeScript 5.0+
try {
  const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'))
  const vueVersion = pkg.dependencies.vue
  const tsVersion = pkg.devDependencies.typescript
  
  checks.push({
    name: 'Vue 3.5+ installed',
    passed: vueVersion && vueVersion.includes('3.5'),
    details: `Vue version: ${vueVersion}`
  })
  
  checks.push({
    name: 'TypeScript 5.0+ installed',
    passed: tsVersion && parseFloat(tsVersion.replace(/[^0-9.]/g, '')) >= 5.0,
    details: `TypeScript version: ${tsVersion}`
  })
} catch (error) {
  checks.push({
    name: 'package.json readable',
    passed: false,
    details: error.message
  })
}

// Check 2: TypeScript strict mode
try {
  const tsConfig = JSON.parse(readFileSync(join(projectRoot, 'tsconfig.json'), 'utf-8'))
  checks.push({
    name: 'TypeScript strict mode enabled',
    passed: tsConfig.compilerOptions.strict === true,
    details: `strict: ${tsConfig.compilerOptions.strict}`
  })
} catch (error) {
  checks.push({
    name: 'tsconfig.json readable',
    passed: false,
    details: error.message
  })
}

// Check 3: Path aliases configured
try {
  const tsConfig = JSON.parse(readFileSync(join(projectRoot, 'tsconfig.json'), 'utf-8'))
  const viteConfig = readFileSync(join(projectRoot, 'vite.config.ts'), 'utf-8')
  
  const tsAliasExists = tsConfig.compilerOptions.paths && tsConfig.compilerOptions.paths['@/*']
  const viteAliasExists = viteConfig.includes("'@'") && viteConfig.includes('./src')
  
  checks.push({
    name: 'Path alias @/* configured',
    passed: tsAliasExists && viteAliasExists,
    details: `tsconfig: ${tsAliasExists}, vite: ${viteAliasExists}`
  })
} catch (error) {
  checks.push({
    name: 'Path alias configuration',
    passed: false,
    details: error.message
  })
}

// Check 4: ESLint configuration
checks.push({
  name: 'ESLint config exists',
  passed: existsSync(join(projectRoot, '.eslintrc.cjs')),
  details: '.eslintrc.cjs'
})

// Check 5: Prettier configuration
checks.push({
  name: 'Prettier config exists',
  passed: existsSync(join(projectRoot, '.prettierrc')),
  details: '.prettierrc'
})

// Check 6: Pre-commit hook
checks.push({
  name: 'Pre-commit hook exists',
  passed: existsSync(join(projectRoot, '.git', 'hooks', 'pre-commit')),
  details: '.git/hooks/pre-commit'
})

// Check 7: Environment files
checks.push({
  name: '.env file exists',
  passed: existsSync(join(projectRoot, '.env')),
  details: '.env'
})

checks.push({
  name: '.env.production file exists',
  passed: existsSync(join(projectRoot, '.env.production')),
  details: '.env.production'
})

// Check 8: Vite configuration
checks.push({
  name: 'Vite config exists',
  passed: existsSync(join(projectRoot, 'vite.config.ts')),
  details: 'vite.config.ts'
})

// Print results
console.log('Setup Verification Results:\n')
console.log('=' .repeat(60))

let allPassed = true
checks.forEach(check => {
  const icon = check.passed ? '✅' : '❌'
  console.log(`${icon} ${check.name}`)
  if (check.details) {
    console.log(`   ${check.details}`)
  }
  if (!check.passed) {
    allPassed = false
  }
})

console.log('=' .repeat(60))
console.log(`\n${allPassed ? '🎉 All checks passed!' : '⚠️  Some checks failed. Please review above.'}\n`)

process.exit(allPassed ? 0 : 1)
