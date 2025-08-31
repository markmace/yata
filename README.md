# YATA - Yet Another Todo App

A modern, gesture-driven todo app with a daily-focused calendar view. Built for quick task management with intuitive interactions and powerful editing features.

## 🚀 Quick Start

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

## ✨ Features

### 📅 **Daily Organization**
- **Infinite calendar** - Scroll through days to plan ahead
- **Daily cards** - Each day gets its own organized section
- **Quick add** - Tap the `+` button to add todos to any day
- **Auto-organize** - Completed todos automatically collapse

### 🎯 **Todo Management**
- **Three-dot menu** - Access edit, duplicate, and delete options
- **Inline editing** - Tap "Edit" to modify todo titles instantly
- **Smart duplication** - Copy todos to the same or different days
- **Swipe actions** - Left to complete, right to delete (classic gesture support)

### 🖱️ **Interaction Methods**
- **Touch-friendly** - Optimized for mobile with proper hit targets
- **Gesture support** - Swipe and tap interactions throughout
- **Drag mode** - Long-press day headers to enable visual drag feedback
- **Keyboard shortcuts** - Enter to save, Esc to cancel when editing

### 💾 **Data & Sync**
- **Offline-first** - Works without internet using AsyncStorage
- **Soft delete** - Deleted items can be recovered
- **Optimistic updates** - Instant UI feedback for all actions
- **Auto-save** - Changes persist automatically

## 🎮 How to Use

### Basic Actions
1. **Add a todo** - Tap the green `+` button on any day
2. **Complete a todo** - Tap the checkbox or swipe left
3. **Access menu** - Tap the three-dot `⋯` button on any todo
4. **Edit inline** - Select "Edit" from the menu, modify text, press Enter
5. **Duplicate** - Select "Duplicate" to copy a todo
6. **Delete** - Select "Delete" or swipe right for quick removal

### Advanced Features
- **Drag mode** - Long-press any day header to enable visual drag feedback
- **Quick complete** - Swipe left on any todo for instant completion
- **Batch organize** - Completed todos automatically group under each day
- **Future planning** - Scroll down to add todos to upcoming days

## 🛠️ Tech Stack

### Core Technologies
- **React Native + Expo** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript for better development
- **React Native Gesture Handler** - Smooth swipe and drag interactions
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Expo Blur** - iOS-style blur effects (iOS/Android)

### Data & Storage
- **AsyncStorage** - Offline-first local data persistence
- **Custom TodoStore** - Optimized data layer with caching and debouncing
- **Soft delete** - Non-destructive data management

### UI/UX Features
- **Modal-based menus** - Context menus that work across platforms
- **Animated transitions** - Smooth interactions with React Native Animated
- **Platform adaptation** - Web-compatible fallbacks where needed
- **Theme system** - Consistent design tokens throughout

## 📁 Project Structure

```
yata/
├── components/           # Reusable UI components
│   ├── TodoItem.tsx     # Individual todo with menu and interactions
│   ├── DaySection.tsx   # Daily todo container with add functionality
│   ├── TodoInput.tsx    # Input component for adding todos
│   └── TodoSection.tsx  # Section wrapper component
├── screens/             # Main application screens
│   └── MainScreen.tsx   # Primary app interface with infinite scroll
├── services/            # Business logic and data management
│   └── storage.ts       # TodoStore class with AsyncStorage integration
├── styles/              # Design system and theming
│   └── theme.ts         # Colors, typography, spacing, and design tokens
├── types/               # TypeScript type definitions
│   └── todo.ts          # Todo interface and related types
├── utils/               # Helper functions and utilities
│   └── dateUtils.ts     # Date formatting and manipulation
└── docs/                # Documentation and project planning
    ├── manifesto        # Project philosophy and goals
    └── project_plan.md  # Development roadmap and specifications
```

## 🎨 Design Philosophy

YATA follows a **minimal, gesture-first** approach:

- **Reduce cognitive load** - Clear visual hierarchy with generous spacing
- **Gesture-driven** - Swipe, tap, and drag interactions feel natural
- **Daily focus** - Organize by day rather than overwhelming project lists  
- **Progressive disclosure** - Advanced features available but not cluttering
- **Cross-platform** - Works seamlessly on iOS, Android, and web

## 🚧 Development

### Adding Features
1. **Components** - Build reusable UI in `/components`
2. **Types** - Define interfaces in `/types` first
3. **Storage** - Extend TodoStore for data operations
4. **Theme** - Use design tokens from `/styles/theme.ts`

### Key Patterns
- **Optimistic updates** - Update UI immediately, sync data after
- **Error boundaries** - Graceful fallbacks for failed operations
- **Platform checks** - Conditional features for web vs. native
- **Gesture handlers** - Use react-native-gesture-handler for interactions

---

**🎯 Built for productivity, designed for delight** 📱✨

