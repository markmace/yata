// Date utility functions for the current product

export const isOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  return date < today;
};

// Get the start of today
export const getStartOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper functions for date formatting
export const isToday = (date: Date): boolean => {
  return date.toDateString() === new Date().toDateString();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of this week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
};

export const normalizeToDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Generate an array of dates starting from today
export const generateDaySequence = (startDate: Date, numberOfDays: number): Date[] => {
  const days: Date[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < numberOfDays; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// Get a more detailed date format for day headers
export const formatDayHeader = (date: Date): string => {
  const now = new Date();
  
  if (isToday(date)) {
    return `Today • ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  }
  
  if (isTomorrow(date)) {
    return `Tomorrow • ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  }
  
  if (isOverdue(date)) return 'Yesterday'; // In case we show past days
  
  // For this week, show day name with date
  if (isThisWeek(date)) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // For other dates, show full date
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
  });
};

// Check if a date matches a specific day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return normalizeToDay(date1).getTime() === normalizeToDay(date2).getTime();
};
