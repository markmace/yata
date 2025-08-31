# YATA

A todo app that believes today deserves your full attention.

Built around the simple idea that productivity tools should fade into the background, not demand center stage. YATA organizes tasks by days, focuses on the present moment, and lets you move fluidly between what matters now and what might matter tomorrow.

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
```bash
npm start
```
Then press `w` for web, `i` for iOS simulator, or `a` for Android.

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
- Swipe right to edit or copy a todo

### Design Philosophy

YATA is built for people who ask "What matters right now?" rather than "What might matter someday?"

- Focus on today first, but allow planning for the future
- Don't overcomplicate individual tasks
- If you don't complete something today, it's okay - just move it to another day
- Keep the interface clean and distraction-free

## Architecture

```
components/     # UI components like TodoItem, DaySection
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

The app uses optimistic updates - the UI responds immediately while data syncs in the background. This keeps interactions feeling fast and responsive.