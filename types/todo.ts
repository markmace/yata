// Core Todo interface following the project plan
export interface Todo {
  id: string;
  title: string;
  notes?: string;      // Additional details/notes
  createdAt: Date;
  updatedAt?: Date;    // Last modification timestamp
  scheduledFor: Date;  // This drives your infinite scroll
  completedAt?: Date;
  deleted: boolean;    // Soft delete for undo
  longTerm?: boolean;  // Flag for longer-term todos
  sortOrder?: number;  // Explicit ordering within a day/list
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


// Date utilities type helpers
export type DateString = string; // ISO string format for storage
