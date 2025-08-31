#!/bin/bash

# YATA - Expo Environment Setup Script
# This script handles common Expo setup issues and ensures a clean, compatible environment

echo "🚀 YATA - Expo Environment Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

print_status "Checking project structure..."

# Check for common issues
ISSUES_FOUND=0

# Check Node version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check if Expo CLI is available
if ! command -v npx expo &> /dev/null; then
    print_error "Expo CLI not available. Please install it with: npm install -g @expo/cli"
    ((ISSUES_FOUND++))
fi

# Ask user what they want to do
echo ""
echo "What would you like to do?"
echo "1) Clean install (removes node_modules, fixes dependencies)"
echo "2) Quick check (runs expo-doctor only)"
echo "3) Update dependencies to latest compatible versions"
echo "4) Full reset (clean + install + check)"
echo ""
read -p "Choose option (1-4): " OPTION

case $OPTION in
    1|4)
        print_status "Starting clean installation..."
        
        # Remove node_modules and lock file
        if [ -d "node_modules" ]; then
            print_status "Removing node_modules..."
            rm -rf node_modules
        fi
        
        if [ -f "package-lock.json" ]; then
            print_status "Removing package-lock.json..."
            rm -f package-lock.json
        fi
        
        if [ -f "yarn.lock" ]; then
            print_status "Removing yarn.lock..."
            rm -f yarn.lock
        fi
        
        # Install dependencies
        print_status "Installing dependencies..."
        npm install
        
        if [ $? -ne 0 ]; then
            print_error "npm install failed. Trying with --force..."
            npm install --force
        fi
        
        print_success "Dependencies installed"
        ;;
    3)
        print_status "Updating dependencies..."
        npx expo install --fix
        ;;
esac

if [ "$OPTION" = "1" ] || [ "$OPTION" = "2" ] || [ "$OPTION" = "4" ]; then
    # Run expo-doctor to check for issues
    print_status "Running Expo doctor to check for issues..."
    
    if command -v npx expo-doctor &> /dev/null; then
        DOCTOR_OUTPUT=$(npx expo-doctor 2>&1)
        DOCTOR_EXIT_CODE=$?
        
        if [ $DOCTOR_EXIT_CODE -eq 0 ]; then
            print_success "All Expo checks passed!"
        else
            print_warning "Expo doctor found issues:"
            echo "$DOCTOR_OUTPUT"
            
            # Check if it's missing peer dependencies
            if echo "$DOCTOR_OUTPUT" | grep -q "Missing peer dependency"; then
                print_status "Found missing peer dependencies. Attempting to fix..."
                
                # Extract package names and install them
                PACKAGES=$(echo "$DOCTOR_OUTPUT" | grep "Missing peer dependency:" | sed 's/Missing peer dependency: //' | tr '\n' ' ')
                
                if [ ! -z "$PACKAGES" ]; then
                    print_status "Installing missing packages: $PACKAGES"
                    npx expo install $PACKAGES
                    
                    # Run doctor again
                    print_status "Re-checking with expo-doctor..."
                    npx expo-doctor
                fi
            fi
        fi
    else
        print_warning "expo-doctor not available. Installing it..."
        npm install -g expo-doctor
        npx expo-doctor
    fi
fi

# Final status check
print_status "Running final checks..."

# Check if main files exist
MAIN_FILES=("App.tsx" "index.ts" "components/TodoItem.tsx" "components/DaySection.tsx")
for file in "${MAIN_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_warning "✗ $file missing"
    fi
done

# Check TypeScript
print_status "Checking TypeScript..."
if npm run type-check > /dev/null 2>&1; then
    print_success "✓ TypeScript checks pass"
else
    print_warning "✗ TypeScript issues found (run 'npm run type-check' for details)"
fi

echo ""
print_success "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "  • Run 'npm start' to start the development server"
echo "  • Press 'w' for web, 'i' for iOS simulator, 'a' for Android"
echo "  • If you see Metro errors, run this script again with option 1"
echo ""
echo "Useful commands:"
echo "  • npm run type-check  - Check TypeScript"
echo "  • npx expo-doctor     - Check environment"
echo "  • npm start           - Start development server"
echo "  • npm run clear       - Start with cache cleared"
