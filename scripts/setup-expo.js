#!/usr/bin/env node

/**
 * YATA - Expo Environment Setup Script
 * Cross-platform Node.js version for Windows/Mac/Linux
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function info(message) { log(colors.blue, 'INFO', message); }
function success(message) { log(colors.green, 'SUCCESS', message); }
function warning(message) { log(colors.yellow, 'WARNING', message); }
function error(message) { log(colors.red, 'ERROR', message); }

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output: result };
  } catch (err) {
    return { success: false, error: err.message, output: err.stdout };
  }
}

function checkFile(filePath) {
  return fs.existsSync(filePath);
}

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
    return true;
  }
  return false;
}

async function main() {
  console.log('🚀 YATA - Expo Environment Setup');
  console.log('==================================\n');

  // Check if we're in the right directory
  if (!checkFile('package.json')) {
    error('package.json not found. Are you in the project root?');
    process.exit(1);
  }

  // Check Node version
  const nodeVersion = process.version;
  info(`Node.js version: ${nodeVersion}`);

  // Show options
  console.log('What would you like to do?');
  console.log('1) Clean install (removes node_modules, fixes dependencies)');
  console.log('2) Quick check (runs expo-doctor only)');
  console.log('3) Update dependencies to latest compatible versions');
  console.log('4) Full reset (clean + install + check)');
  console.log('5) Install missing peer dependencies only');
  console.log('');

  // For automation, you can pass option as argument
  const option = process.argv[2] || '4'; // Default to full reset

  if (!['1', '2', '3', '4', '5'].includes(option)) {
    error('Invalid option. Use 1-5');
    process.exit(1);
  }

  info(`Running option ${option}...`);

  // Clean install or full reset
  if (['1', '4'].includes(option)) {
    info('Starting clean installation...');
    
    // Remove node_modules and lock files
    if (removeIfExists('node_modules')) {
      success('Removed node_modules');
    }
    if (removeIfExists('package-lock.json')) {
      success('Removed package-lock.json');
    }
    if (removeIfExists('yarn.lock')) {
      success('Removed yarn.lock');
    }
    
    // Install dependencies
    info('Installing dependencies...');
    let installResult = execCommand('npm install');
    
    if (!installResult.success) {
      warning('npm install failed. Trying with --force...');
      installResult = execCommand('npm install --force');
    }
    
    if (installResult.success) {
      success('Dependencies installed');
    } else {
      error('Failed to install dependencies');
      console.log(installResult.error);
    }
  }

  // Update dependencies
  if (option === '3') {
    info('Updating dependencies...');
    const updateResult = execCommand('npx expo install --fix');
    if (updateResult.success) {
      success('Dependencies updated');
    } else {
      warning('Update had issues, but continuing...');
    }
  }

  // Run expo-doctor
  if (['1', '2', '4', '5'].includes(option)) {
    info('Running Expo doctor to check for issues...');
    
    const doctorResult = execCommand('npx expo-doctor', { silent: true });
    
    if (doctorResult.success) {
      success('All Expo checks passed!');
    } else {
      warning('Expo doctor found issues:');
      console.log(doctorResult.output);
      
      // Check for missing peer dependencies
      if (doctorResult.output && doctorResult.output.includes('Missing peer dependency')) {
        info('Found missing peer dependencies. Attempting to fix...');
        
        // Extract package names
        const lines = doctorResult.output.split('\n');
        const packages = [];
        
        lines.forEach(line => {
          if (line.includes('Missing peer dependency:')) {
            const pkg = line.split('Missing peer dependency:')[1]?.trim();
            if (pkg && !packages.includes(pkg)) {
              packages.push(pkg);
            }
          }
        });
        
        if (packages.length > 0) {
          info(`Installing missing packages: ${packages.join(' ')}`);
          const installResult = execCommand(`npx expo install ${packages.join(' ')}`);
          
          if (installResult.success) {
            success('Missing packages installed');
            
            // Re-run doctor
            info('Re-checking with expo-doctor...');
            const recheckResult = execCommand('npx expo-doctor');
            if (recheckResult.success) {
              success('All checks now pass!');
            }
          } else {
            warning('Failed to install some packages');
          }
        }
      }
    }
  }

  // Final checks
  info('Running final checks...');
  
  // Check main files
  const mainFiles = [
    'App.tsx',
    'index.ts',
    'components/TodoItem.tsx',
    'components/DaySection.tsx'
  ];
  
  mainFiles.forEach(file => {
    if (checkFile(file)) {
      success(`✓ ${file} exists`);
    } else {
      warning(`✗ ${file} missing`);
    }
  });
  
  // Check TypeScript
  info('Checking TypeScript...');
  const tsResult = execCommand('npm run type-check', { silent: true });
  if (tsResult.success) {
    success('✓ TypeScript checks pass');
  } else {
    warning('✗ TypeScript issues found (run "npm run type-check" for details)');
  }

  console.log('');
  success('Setup complete! 🎉');
  console.log('');
  console.log('Next steps:');
  console.log('  • Run "npm start" to start the development server');
  console.log('  • Press "w" for web, "i" for iOS simulator, "a" for Android');
  console.log('  • If you see Metro errors, run this script again');
  console.log('');
  console.log('Useful commands:');
  console.log('  • npm run type-check    - Check TypeScript');
  console.log('  • npx expo-doctor       - Check environment');
  console.log('  • npm start             - Start development server');
  console.log('  • npm run setup         - Run this script again');
}

main().catch(err => {
  error('Setup failed:');
  console.error(err);
  process.exit(1);
});
