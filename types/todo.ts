// Core Todo interface following the project plan
export interface Todo {
  id: string;
  title: string;
  notes?: string;      // Additional details/notes
  createdAt: Date;
  scheduledFor: Date;  // This drives your infinite scroll
  completedAt?: Date;
  deleted: boolean;    // Soft delete for undo
  longTerm?: boolean;  // Flag for longer-term todos
  listId?: string;     // ID of the list this todo belongs to
}

// Additional metadata interface for future AI features
export interface TodoMetadata {
  autoScheduled?: boolean;
  suggestedTime?: string;
  category?: string;  // AI-inferred
  priority?: number;   // AI-calculated
}

// Extended Todo with metadata (for future use)
export interface ExtendedTodo extends Todo {
  metadata?: TodoMetadata;
}

// Section data structure for SectionList
export interface TodoSection {
  title: string;
  data: Todo[];
}

// Filter states
export type TodoFilter = 'all' | 'uncompleted' | 'completed';

// List interface for custom todo lists
export interface TodoList {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  deleted: boolean;
}

// Date utilities type helpers
export type DateString = string; // ISO string format for storage
