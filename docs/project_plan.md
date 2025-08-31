## YATA Project Plan

### Initial Setup
```bash
npx create-expo-app yata --template expo-template-blank-typescript
cd yata
npx expo install expo-router expo-dev-client
```

Use Expo Router from day 1 - file-based routing will keep your navigation clean as you grow.

### Core Data  higherModel
```typescript
// types/todo.ts
interface Todo {
  id: string;
  title: string;
  createdAt: Date;
  scheduledFor: Date;  // This drives your infinite scroll
  completedAt?: Date;
  deleted: boolean;    // Soft delete for undo
}
```

**Senior tip**: Use `scheduledFor` not `dueDate`. It's more flexible - todos can be scheduled for any day, not just "due". Store all dates as ISO strings in storage, convert to Date objects in memory.

### Storage Layer
Start with AsyncStorage, but wrap it immediately:

```typescript
// services/storage.ts
class TodoStore {
  private cache: Map<string, Todo> = new Map();
  
  async getTodos(): Promise<Todo[]> {
    // Returns sorted array from cache
    // Lazy-loads from AsyncStorage if cache empty
  }
  
  async upsert(todo: Todo): Promise<void> {
    // Update cache + persist
    // Debounce the persist for performance
  }
}
```

**Why**: You'll outgrow AsyncStorage. This abstraction lets you swap to SQLite/WatermelonDB later without touching components.

### Infinite Scroll Architecture

Don't actually build infinite scroll. Build a **windowed list** with date sections:

```typescript
// Three data buckets:
const sections = [
  { title: 'Overdue', data: overdueTodos },  // Red or something
  { title: 'Today', data: todayTodos },      // Always visible
  { title: 'Tomorrow', data: tomorrowTodos },
  { title: 'This Week', data: weekTodos },
  { title: 'Future', data: futureTodos },    // Collapsed by default
]
```

Use `SectionList` not `FlatList`. The sections give you natural breakpoints and better UX than true infinite scroll.

### Key Implementation Patterns

**1. Optimistic Updates**
```typescript
const toggleTodo = (id: string) => {
  // Update UI immediately
  setTodos(prev => prev.map(t => 
    t.id === id ? {...t, completedAt: new Date()} : t
  ));
  // Then persist (with error recovery)
  todoStore.upsert(updatedTodo).catch(() => {
    // Revert on failure
  });
};
```

**2. Smart Date Handling**
```typescript
// Don't use moment.js or date-fns yet
const isToday = (date: Date) => {
  return date.toDateString() === new Date().toDateString();
};

// But DO normalize times
const normalizeToDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
```

**3. Uncompleted Stack**
This isn't a separate view - it's a filter state:
```typescript
const [showingUncompleted, setShowingUncompleted] = useState(false);

// In your data selector
const visibleTodos = showingUncompleted 
  ? todos.filter(t => !t.completedAt && !t.scheduledFor)
  : todos.filter(t => !t.completedAt);
```

### Component Structure

Keep it flat initially:
```
components/
  TodoItem.tsx       // Single todo row
  TodoInput.tsx      // Add new todo
  TodoSection.tsx    // Date section wrapper
screens/
  MainScreen.tsx     // Your SectionList lives here
```

**Don't** create `components/common/`, `components/shared/`, etc. until you actually have duplication.

### Gesture Handling

React Native Gesture Handler from the start:
```typescript
import { Swipeable } from 'react-native-gesture-handler';

// Swipe to complete/delete
<Swipeable
  renderRightActions={() => <DeleteAction />}
  onSwipeableOpen={() => markComplete(todo.id)}
>
  <TodoItem todo={todo} />
</Swipeable>
```

### State Management

**Don't add Redux/MobX/Zustand yet**. Use React's built-in tools:
- `useReducer` for complex todo operations
- `useContext` for the TodoStore instance
- `useMemo` for filtered/sorted lists

When you need global state, add Zustand - it's 8KB and works like useState.

### Performance Markers

These numbers tell you when to optimize:
- < 100 todos: anything works
- 100-1000 todos: need windowing/sections
- 1000+ todos: need SQLite + indexes
- 10000+ todos: need virtual scrolling + lazy loading

### Testing Strategy

Just two types initially:
1. **Data operations**: Pure functions for todo manipulation
2. **Critical paths**: Adding a todo, completing a todo

Skip component testing until your UI stabilizes.

### AI Preparation

Structure for easy AI addition:
```typescript
interface TodoMetadata {
  autoScheduled?: boolean;
  suggestedTime?: string;
  category?: string;  // AI-inferred
  priority?: number;   // AI-calculated
}
```

Keep AI metadata separate from core todo data. You can always merge later.

### Platform-Specific Code

You'll need minimal platform code:
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  todoItem: {
    padding: Platform.OS === 'ios' ? 16 : 12,
    // iOS likes more breathing room
  }
});
```

### Quick Wins

1. **Haptic feedback** on iOS: `import * as Haptics from 'expo-haptics';`
2. **Pull to refresh**: Built into SectionList
3. **Keyboard avoiding**: Use `KeyboardAvoidingView` early
4. **Dark mode**: Use `useColorScheme()` hook from the start

### Common Pitfalls to Avoid

- Don't use `Date.now()` for IDs - use `crypto.randomUUID()`
- Don't store Date objects in AsyncStorage - use ISO strings
- Don't fetch all todos on every render - cache aggressively
- Don't build "undo" as state restoration - use soft delete + timers

### First Working Version Goals

Ship when you can:
1. Add a todo (just title)
2. See it in "Today"
3. Swipe to complete
4. Pull to refresh
5. Persist across app restarts

Everything else is iteration. The infinite scroll? That's just showing more sections. The AI features? That's just adding metadata. Keep the core loop tight.