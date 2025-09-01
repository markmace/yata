<img src="docs/yata_logo_dark_text.png" alt="YATA Logo" width="250"/>

Yet Another TODO App. 

Built around the simple ideas around focusing most on today and that productivity tools should fade into the background, not demand center stage. YATA organizes tasks by days, focuses on the present moment, and lets you move fluidly between what matters now and what might matter tomorrow.

## Getting Started

### First Time Setup
```bash
npm run setup
```
This automatically handles dependency installation and environment configuration.

### Having Issues? (Metro errors, dependency conflicts)
```bash
npm run setup-full
```
This completely resets your environment with compatible versions.

### Daily Development

#### iOS Development (a lot of work)
```bash
# Build and run on iOS simulator (first time or after major changes)
npx expo run:ios --device "iPhone 16 Pro"  # Replace with your preferred simulator

# For subsequent runs (faster startup)
npx expo start --ios
```

#### Other Platforms
```bash
npm start
```
Then press `w` for web or `a` for Android.

### Troubleshooting Commands
- `npm run setup-check` - Quick environment health check
- `npm run doctor` - Run Expo environment diagnostics  
- `npm run type-check` - Check for TypeScript errors

## How It Works

YATA shows you an infinite list of days, starting with today. Each day has its own section where you can add todos. 

The core philosophy: tasks are fluid, not fixed. A task assigned to Tuesday that isn't finished doesn't become a failure—it becomes a choice. Move it to Wednesday, carry it to next week, or let it go entirely.

### Basic Usage

- Tap the "+" button on any day to add a todo
- Tap the checkbox to mark todos complete
- Swipe left to delete a todo
- Swipe right to access actions:
  - **Move**: Reschedule a todo to a different day
  - **Edit**: Change the todo text
  - **Copy**: Duplicate the todo
- Long-press and drag to reorder todos
- Tap on completed todos section to expand/collapse

### Design Philosophy

YATA is built for people who ask "What matters right now?" rather than "What might matter someday?"

- Focus on today first, but allow planning for the future
- Don't overcomplicate individual tasks
- If you don't complete something today, it's okay - just move it to another day
- Keep the interface clean and distraction-free

## Features

- **Daily Todo Organization**: Todos organized by day with infinite scrolling
- **Long-Term Goals**: Special section for todos not tied to a specific day
- **Gesture Controls**: Intuitive swipe actions for common operations
- **Todo Movement**: Easily move todos between days
- **Collapsible Completed Todos**: Keep your interface clean by hiding completed items
- **Drag & Drop Reordering**: Prioritize your todos by reordering them

## Architecture

```
components/     # UI components like TodoItem, DaySection, LongTermSection
screens/        # Main app screens
services/       # Data storage and business logic
types/          # TypeScript definitions
utils/          # Helper functions
styles/         # Theme and design system
```

The app uses AsyncStorage for local data persistence, React Native Gesture Handler for swipe interactions, and follows a clean component architecture.

## Tech Stack

- React Native with Expo
- TypeScript
- AsyncStorage for data
- React Native Gesture Handler for swipes
- Expo Linear Gradient and Blur for UI effects

## Development

To add new features, start by defining types in `/types`, implement the logic in `/services`, and build UI components in `/components`. The theme system in `/styles/theme.ts` provides consistent colors and spacing.
