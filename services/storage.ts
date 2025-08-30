import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, DateString } from '../types/todo';

// Storage keys
const TODOS_KEY = '@yata_todos';

// Serializable Todo for storage (dates as ISO strings)
interface StorableTodo {
  id: string;
  title: string;
  notes?: string;
  createdAt: DateString;
  scheduledFor: DateString;
  completedAt?: DateString;
  deleted: boolean;
}

export class TodoStore {
  private cache: Map<string, Todo> = new Map();
  private isLoaded = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  // Convert Todo to storable format
  private toStorable(todo: Todo): StorableTodo {
    return {
      ...todo,
      createdAt: todo.createdAt.toISOString(),
      scheduledFor: todo.scheduledFor.toISOString(),
      completedAt: todo.completedAt?.toISOString(),
    };
  }

  // Convert storable to Todo format
  private fromStorable(storable: StorableTodo): Todo {
    return {
      ...storable,
      createdAt: new Date(storable.createdAt),
      scheduledFor: new Date(storable.scheduledFor),
      completedAt: storable.completedAt ? new Date(storable.completedAt) : undefined,
    };
  }

  // Lazy load from AsyncStorage
  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(TODOS_KEY);
      if (stored) {
        const storableTodos: StorableTodo[] = JSON.parse(stored);
        this.cache.clear();
        storableTodos.forEach(storable => {
          const todo = this.fromStorable(storable);
          this.cache.set(todo.id, todo);
        });
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load todos from storage:', error);
      this.isLoaded = true; // Mark as loaded even on error to prevent infinite retries
    }
  }

  // Debounced persist to avoid too frequent writes
  private async persist(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        const todos = Array.from(this.cache.values());
        const storableTodos = todos.map(todo => this.toStorable(todo));
        await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(storableTodos));
      } catch (error) {
        console.error('Failed to persist todos:', error);
      }
    }, 300); // 300ms debounce
  }

  // Get all todos, sorted by scheduledFor
  async getTodos(): Promise<Todo[]> {
    await this.ensureLoaded();
    
    const todos = Array.from(this.cache.values())
      .filter(todo => !todo.deleted) // Filter out soft-deleted todos
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    
    return todos;
  }

  // Get a single todo by ID
  async getTodo(id: string): Promise<Todo | undefined> {
    await this.ensureLoaded();
    return this.cache.get(id);
  }

  // Insert or update a todo
  async upsert(todo: Todo): Promise<void> {
    await this.ensureLoaded();
    this.cache.set(todo.id, { ...todo });
    await this.persist();
  }

  // Soft delete a todo
  async softDelete(id: string): Promise<void> {
    await this.ensureLoaded();
    const todo = this.cache.get(id);
    if (todo) {
      todo.deleted = true;
      this.cache.set(id, todo);
      await this.persist();
    }
  }

  // Hard delete a todo (permanent)
  async hardDelete(id: string): Promise<void> {
    await this.ensureLoaded();
    this.cache.delete(id);
    await this.persist();
  }

  // Restore a soft-deleted todo
  async restore(id: string): Promise<void> {
    await this.ensureLoaded();
    const todo = this.cache.get(id);
    if (todo && todo.deleted) {
      todo.deleted = false;
      this.cache.set(id, todo);
      await this.persist();
    }
  }

  // Clear all todos (for testing/reset)
  async clear(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(TODOS_KEY);
  }
}

// Singleton instance
export const todoStore = new TodoStore();
