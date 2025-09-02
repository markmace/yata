// Core Todo interface following the project plan
export interface Todo {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt?: Date;    // Last modification timestamp
  scheduledFor: Date;  // This drives your infinite scroll
  completedAt?: Date;
  deleted: boolean;    // Soft delete for undo

  sortOrder?: number;  // Explicit ordering within a day/list
}

// Section data structure for SectionList (kept for potential future use)
export interface TodoSection {
  title: string;
  data: Todo[];
}
