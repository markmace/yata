# YATA - Yet Another Todo App

A modern, daily-focused todo application built with React Native and Expo. Features an infinite daily calendar view, quick add-to-day functionality, and gesture-driven interactions.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (18+) - [Download here](https://nodejs.org/)
- **Expo Go app** on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   cd yata
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run start
   ```

3. **Open the app (choose the easiest option):**
   - **🌐 Web (simplest):** Press `w` for web browser
   - **📱 Phone:** Scan QR code with Expo Go app
   - **💻 Simulator:** Press `i` for iOS or `a` for Android emulator

## 📱 How to Use

### ➕ Adding Todos
- **Tap the "+" button** on any day card to add a todo to that specific day
- **Quick inline input** - Type and press Enter to add
- **Today is at the top** - Always visible and easy to access

### ✅ Completing Todos
- **Tap the checkbox** next to any todo
- **Swipe left** on a todo to reveal complete/undo action
- **Completed todos** are moved to a collapsed section in each day card

### 🗑️ Deleting Todos
- **Swipe right** on any todo to reveal delete action
- Confirm deletion in the popup dialog
- Uses soft delete - todos can be recovered if needed

### 📅 Daily Calendar View
Your todos are organized in an infinite daily calendar:

- **📍 Today** - Always at the top, most prominent
- **➡️ Tomorrow** - Next day down
- **📅 Future Days** - Scroll to see upcoming days (30 days visible)
- **Day Cards** - Each day is a separate card with its own todos
- **Smart Headers** - "Today", "Tomorrow", "Monday, Jan 15", etc.

### 🔄 Refreshing
- **Pull down** on the todo list to refresh and sync data

## ✨ Features

- **📅 Daily-focused** - Infinite calendar view for planning ahead
- **➕ Quick add-to-day** - Add todos to any specific day with one tap
- **👆 Gesture-driven** - Swipe to complete or delete
- **🏃‍♂️ Optimistic updates** - Instant feedback, no waiting
- **💾 Auto-save** - Changes are automatically saved
- **📱 Offline-first** - Works without internet, syncs when available
- **🎨 Clean cards** - Each day is a beautiful, organized card

## 🔧 Development Commands

```bash
# Start development server
npm run start

# Run on specific platforms
npm run ios          # iOS simulator
npm run android      # Android emulator  
npm run web          # Web browser

# Clear cache (if needed)
npx expo start --clear
```

## 📁 Project Structure

```
yata/
├── components/      # Reusable UI components
│   ├── TodoItem.tsx    # Individual todo with swipe actions
│   ├── TodoInput.tsx   # Add new todo input
│   └── TodoSection.tsx # Section headers
├── screens/         # Main app screens
│   └── MainScreen.tsx  # Primary todo list view
├── services/        # Business logic
│   └── storage.ts      # AsyncStorage wrapper
├── types/           # TypeScript definitions
│   └── todo.ts         # Todo interfaces
├── utils/           # Helper functions
│   └── dateUtis.ts    # Date manipulation utilities
└── assets/          # Images and icons
```

## 🚗 Quick Start Workflow

1. **Launch the app** - Use web browser (simplest) or scan QR code
2. **See today's card** - The first card at the top
3. **Tap the "+" button** - Add your first todo to today
4. **Scroll down** - See tomorrow and upcoming days
5. **Add todos to future days** - Tap "+" on any day card
6. **Try swiping** - Left to complete, right to delete
7. **See completed todos** - They appear in a collapsed section

## 🔮 Future Features (Roadmap)

- 🤖 **AI scheduling** - Smart time suggestions
- 🔔 **Notifications** - Reminders and alerts
- ☁️ **Cloud sync** - Cross-device synchronization
- 🏷️ **Categories** - Organize by projects/contexts
- 📈 **Analytics** - Productivity insights
- 🌙 **Dark mode** - Easy on the eyes

## 🐛 Troubleshooting

**App won't start?**
- Run `npx expo start --clear` to clear cache
- Make sure you're in the `yata` directory

**QR code not working?**
- Try pressing `s` to switch to Expo Go mode
- Make sure your phone and computer are on the same WiFi

**Gestures not working?**
- Make sure you have the latest version of Expo Go
- Try restarting the development server

