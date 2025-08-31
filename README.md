# YATA - Yet Another Todo App

A daily-focused todo app with an infinite calendar view. Add todos to any day, swipe to complete or delete, and keep your tasks organized by date.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd yata
   npm install
   ```

2. **Run the app:**
   ```bash
   npm run start
   ```

3. **Test it:**
   - **Web (easiest):** Press `w` 
   - **Phone:** Scan QR code with Expo Go app
   - **Simulator:** Press `i` (iOS) or `a` (Android)

## How It Works

- **Daily cards** - Each day gets its own card
- **+ button** - Click to add todos to any day
- **Swipe actions** - Left to complete, right to delete
- **Auto-organize** - Completed todos collapse under each day
- **Scroll to plan** - See upcoming days and add future todos

## Tech Stack

- React Native + Expo
- TypeScript
- AsyncStorage for offline data
- Gesture-driven UI with swipe actions

## Project Structure

```
yata/
├── components/    # UI components (TodoItem, DaySection, etc.)
├── screens/       # Main screens
├── services/      # Data storage and business logic
├── types/         # TypeScript definitions
└── utils/         # Helper functions (date handling, etc.)
```

---

**Built with React Native and Expo** 📱

