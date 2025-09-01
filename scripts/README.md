# YATA Setup Scripts

These scripts help you manage your Expo environment and fix common dependency issues.

## Quick Start

If you're having Metro bundler errors or dependency conflicts:

```bash
npm run setup
```

This runs the full setup process automatically.

## Available Scripts

### Main Setup Commands

- **`npm run setup`** - Interactive setup (default: full reset)
- **`npm run setup-full`** - Complete clean install + check (recommended)
- **`npm run setup-clean`** - Clean install only (removes node_modules, reinstalls)
- **`npm run setup-check`** - Quick environment check only
- **`npm run setup-update`** - Update dependencies to compatible versions

### Utility Commands

- **`npm run doctor`** - Run expo-doctor to check environment
- **`npm run type-check`** - Check TypeScript for errors
- **`npm start`** - Start development server
- **`npm run clear`** - Start with cleared cache

## When to Use Each Script

### **Metro Bundler Errors** (like we just fixed)
```bash
npm run setup-full
```
This completely resets your environment with compatible versions.

### 🔍 **Quick Health Check**
```bash
npm run setup-check
# or
npm run doctor
```

### **Dependency Updates**
```bash
npm run setup-update
```
Uses `npx expo install --fix` to update to compatible versions.

### **Clean Install Only**
```bash
npm run setup-clean
```
Just removes node_modules and reinstalls, no other checks.

## Manual Script Usage

You can also run the scripts directly:

```bash
# Interactive mode
node scripts/setup-expo.js

# Specific options (1-5)
node scripts/setup-expo.js 1  # Clean install
node scripts/setup-expo.js 2  # Check only  
node scripts/setup-expo.js 3  # Update deps
node scripts/setup-expo.js 4  # Full reset
node scripts/setup-expo.js 5  # Fix peer deps only
```

### Auto-Fix Features
- **Missing peer dependencies** - Automatically detects and installs
- **Version conflicts** - Uses Expo-compatible versions
- **Metro bundler issues** - Clean install resolves most problems
- **TypeScript errors** - Reports issues for manual fixing
