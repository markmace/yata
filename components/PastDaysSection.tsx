import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Todo } from '../types/todo';
import { DaySection } from './DaySection';
import { theme } from '../styles/theme';
import { formatDayHeader } from '../utils/dateUtils';

interface PastDaysSectionProps {
  pastDays: Date[];
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDuplicate: (todo: Todo) => void;
  onMove?: (todo: Todo, newDate: Date) => void;
  onAddTodo: (title: string, date: Date) => void;
  onReorderTodos?: (todos: Todo[]) => void;
}

export const PastDaysSection: React.FC<PastDaysSectionProps> = ({
  pastDays,
  todos,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onMove,
  onAddTodo,
  onReorderTodos,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Reset selected date when collapsing
    if (isExpanded) {
      setSelectedDate(null);
    }
  };
  
  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Get todos for a specific day
  const getTodosForDay = (date: Date): Todo[] => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.scheduledFor);
      return (
        todoDate.getFullYear() === date.getFullYear() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getDate() === date.getDate()
      );
    });
  };

  // Count todos for all past days
  const pastTodoCount = pastDays.reduce((count, date) => {
    return count + getTodosForDay(date).filter(todo => !todo.completedAt).length;
  }, 0);

  const ContainerComponent = Platform.OS === 'web' ? View : BlurView;
  const containerProps = Platform.OS === 'web' ? {} : { intensity: 20 };

  return (
    <ContainerComponent {...containerProps} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <TouchableOpacity
          style={styles.header}
          onPress={handleToggleExpand}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <MaterialIcons
              name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
              size={24}
              color={theme.colors.text.primary}
            />
            <View>
              <Text style={styles.title}>Past Days</Text>
              {!isExpanded && pastTodoCount > 0 && (
                <Text style={styles.subtitle}>You have {pastTodoCount} uncompleted tasks from previous days</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {pastTodoCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.todoCount}>{pastTodoCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Past Days List */}
        {isExpanded && (
          <View>
            {/* Date selector */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.dateSelector}
              contentContainerStyle={styles.dateSelectorContent}
            >
              {pastDays.map((date) => {
                const dayTodos = getTodosForDay(date);
                const hasItems = dayTodos.length > 0;
                const isSelected = selectedDate && 
                  date.getDate() === selectedDate.getDate() && 
                  date.getMonth() === selectedDate.getMonth() && 
                  date.getFullYear() === selectedDate.getFullYear();
                
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dateButton,
                      isSelected && styles.selectedDateButton,
                      !hasItems && styles.emptyDateButton
                    ]}
                    onPress={() => handleSelectDate(date)}
                    disabled={!hasItems}
                  >
                    <Text 
                      style={[
                        styles.dateButtonDay, 
                        isSelected && styles.selectedDateText,
                        !hasItems && styles.emptyDateText
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    <Text 
                      style={[
                        styles.dateButtonMonth, 
                        isSelected && styles.selectedDateText,
                        !hasItems && styles.emptyDateText
                      ]}
                    >
                      {date.toLocaleDateString(undefined, { month: 'short' })}
                    </Text>
                    {hasItems && (
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>
                          {dayTodos.filter(t => !t.completedAt).length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            {/* Selected day content */}
            {selectedDate ? (
              <DaySection
                date={selectedDate}
                todos={getTodosForDay(selectedDate)}
                onAddTodo={onAddTodo}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onMove={onMove}
                onReorderTodos={onReorderTodos}
              />
            ) : (
              <View style={styles.selectPrompt}>
                <MaterialIcons name="calendar-today" size={28} color={theme.colors.text.secondary} style={styles.promptIcon} />
                <Text style={styles.selectPromptText}>Select a date above to view past tasks</Text>
                <Text style={styles.selectPromptSubtext}>Dates with uncompleted tasks are highlighted</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.elevated,
    marginBottom: theme.spacing.md, // Reduced margin
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  innerContainer: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: theme.colors.jade.dark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  todoCount: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  dateSelector: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
  },
  dateSelectorContent: {
    paddingHorizontal: theme.spacing.md,
  },
  dateButton: {
    width: 70,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  selectedDateButton: {
    backgroundColor: theme.colors.jade.main,
    borderWidth: 2,
    borderColor: theme.colors.jade.dark,
  },
  emptyDateButton: {
    opacity: 0.5,
  },
  dateButtonDay: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  dateButtonMonth: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  selectedDateText: {
    color: theme.colors.text.inverse,
  },
  emptyDateText: {
    color: theme.colors.text.tertiary,
  },
  dateBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: theme.colors.actions.delete, // Red for attention
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  dateBadgeText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.bold,
  },
  selectPrompt: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
  },
  promptIcon: {
    marginBottom: theme.spacing.md,
  },
  selectPromptText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  selectPromptSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
