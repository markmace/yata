# YATA - Yet Another Todo App

A modern, daily-focused todo application built with React Native and Expo. YATA provides an infinite daily calendar view with quick add-to-day functionality and intuitive gesture-driven interactions for managing your tasks.

## Getting Started

### Prerequisites

Before running YATA, you'll need:

- **Node.js** version 18 or higher - [Download here](https://nodejs.org/)
- **Expo Go app** installed on your mobile device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   cd yata
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run start
   ```

3. **Choose how to run the app:**
   - **Web browser (recommended for testing):** Press `w`
   - **Mobile device:** Scan the QR code with Expo Go
   - **iOS Simulator:** Press `i`
   - **Android Emulator:** Press `a`

## How to Use

### Adding Todos

Click the "+" button on any day card to add a todo for that specific day. The input field supports quick entry - just type your todo and press Enter. Today's section is always visible at the top for easy access.

### Managing Todos

**Completing tasks:** Tap the checkbox next to any todo, or swipe left to reveal completion actions. Completed todos are automatically moved to a collapsed section within each day card.

**Deleting tasks:** Swipe right on any todo to reveal the delete action. The app uses soft deletion, so tasks can be recovered if needed.

### Daily Calendar View

Your todos are organized in an infinite daily calendar layout:

- **Today** appears at the top with the most prominent styling
- **Tomorrow** follows immediately below
- **Future days** are accessible by scrolling (up to 30 days visible)
- Each day has its own card with smart headers like "Today", "Tomorrow", or "Monday, Jan 15"

### Refreshing Data

Pull down on the todo list to refresh and sync your data.

## Features

- **Daily-focused design** with infinite calendar scrolling for future planning
- **Quick add-to-day** functionality to assign todos to specific dates
- **Gesture-driven interface** with swipe actions for completion and deletion
- **Optimistic updates** provide instant feedback without waiting for server responses
- **Auto-save functionality** ensures changes are preserved automatically
- **Offline-first architecture** works without internet and syncs when available
- **Clean card-based UI** with organized day sections

## Development Commands

```bash
# Start development server
npm run start

# Platform-specific commands
npm run ios          # iOS simulator
npm run android      # Android emulator  
npm run web          # Web browser

# Clear cache if needed
npx expo start --clear
```

## Project Structure

```
yata/
├── components/         # Reusable UI components
│   ├── TodoItem.tsx       # Individual todo with swipe actions
│   ├── TodoInput.tsx      # Add new todo input field
│   └── TodoSection.tsx    # Section headers and organization
├── screens/           # Main application screens
│   └── MainScreen.tsx     # Primary todo list interface
├── services/          # Business logic and data management
│   └── storage.ts         # AsyncStorage wrapper and utilities
├── types/             # TypeScript type definitions
│   └── todo.ts            # Todo-related interfaces and types
├── utils/             # Helper functions and utilities
│   └── dateUtils.ts       # Date manipulation and formatting
└── assets/            # Static assets (images, icons)
```

## Quick Start Guide

1. Launch the app using your preferred method (web browser is simplest for testing)
2. Find today's card at the top of the interface
3. Click the "+" button to add your first todo
4. Scroll down to see tomorrow and upcoming days
5. Add todos to future days by clicking "+" on any day card
6. Try the swipe gestures: left to complete, right to delete
7. View completed todos in the collapsed section of each day

## Planned Features

The following features are on the development roadmap:

- **AI-powered scheduling** with smart time suggestions
- **Push notifications** for reminders and alerts
- **Cloud synchronization** for cross-device access
- **Category system** for organizing by projects or contexts
- **Analytics dashboard** with productivity insights
- **Dark mode** support

## Troubleshooting

**Application won't start?**
- Run `npx expo start --clear` to clear the cache
- Verify you're in the correct `yata` directory

**QR code scanning issues?**
- Press `s` to switch to Expo Go mode
- Ensure your phone and computer are connected to the same WiFi network

**Gesture interactions not working?**
- Update to the latest version of Expo Go
- Restart the development server

