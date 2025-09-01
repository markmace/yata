import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoList } from '../types/todo';

// Storage keys
const LISTS_KEY = '@yata_lists';

// Serializable List for storage (dates as ISO strings)
interface StorableTodoList {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  deleted: boolean;
}

export class ListStore {
  private cache: Map<string, TodoList> = new Map();
  private isLoaded = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  // Convert TodoList to storable format
  private toStorable(list: TodoList): StorableTodoList {
    return {
      ...list,
      createdAt: list.createdAt.toISOString(),
    };
  }

  // Convert storable to TodoList format
  private fromStorable(storable: StorableTodoList): TodoList {
    return {
      ...storable,
      createdAt: new Date(storable.createdAt),
    };
  }

  // Lazy load from AsyncStorage
  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(LISTS_KEY);
      if (stored) {
        const storableLists: StorableTodoList[] = JSON.parse(stored);
        this.cache.clear();
        storableLists.forEach(storable => {
          const list = this.fromStorable(storable);
          this.cache.set(list.id, list);
        });
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load lists from storage:', error);
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
        const lists = Array.from(this.cache.values());
        const storableLists = lists.map(list => this.toStorable(list));
        await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(storableLists));
      } catch (error) {
        console.error('Failed to persist lists:', error);
      }
    }, 300); // 300ms debounce
  }

  // Get all lists
  async getLists(): Promise<TodoList[]> {
    await this.ensureLoaded();
    
    const lists = Array.from(this.cache.values())
      .filter(list => !list.deleted) // Filter out deleted lists
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return lists;
  }

  // Get a single list by ID
  async getList(id: string): Promise<TodoList | undefined> {
    await this.ensureLoaded();
    return this.cache.get(id);
  }

  // Insert or update a list
  async upsert(list: TodoList): Promise<void> {
    await this.ensureLoaded();
    this.cache.set(list.id, { ...list });
    await this.persist();
  }

  // Delete a list
  async softDelete(id: string): Promise<void> {
    await this.ensureLoaded();
    const list = this.cache.get(id);
    if (list) {
      list.deleted = true;
      this.cache.set(id, list);
      await this.persist();
    }
  }

  // Hard delete a list (permanent)
  async hardDelete(id: string): Promise<void> {
    await this.ensureLoaded();
    this.cache.delete(id);
    await this.persist();
  }

  // Clear all lists (for testing/reset)
  async clear(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(LISTS_KEY);
  }
}

// Singleton instance
export const listStore = new ListStore();
