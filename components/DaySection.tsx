import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';
import { formatDayHeader } from '../utils/dateUtils';
import { theme } from '../styles/theme';

interface DaySectionProps {
  date: Date;
  todos: Todo[];
  onAddTodo: (title: string, date: Date) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDuplicate: (todo: Todo) => void;
  onReorderTodos?: (todos: Todo[]) => void;
  onTodoPress?: (todo: Todo) => void;
}

export const DaySection: React.FC<DaySectionProps> = ({
  date,
  todos,
  onAddTodo,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onReorderTodos,
  onTodoPress,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  // Drag and drop is always enabled

  const handleAddTodo = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAddTodo(trimmedValue, date);
      setInputValue('');
      setShowInput(false);
    }
  };

  const handleAddPress = () => {
    setShowInput(true);
  };

  const handleCancel = () => {
    setInputValue('');
    setShowInput(false);
  };

  const handleReorderTodos = (data: Todo[]) => {
    if (!onReorderTodos) return;
    
    // Combine with completed todos
    const allTodos = [...data, ...completedTodos];
    onReorderTodos(allTodos);
  };

  // Remove drag mode toggle - not needed anymore

  const renderTodoItem = ({ item: todo, drag, isActive }: RenderItemParams<Todo>) => (
    <TodoItem
      todo={todo}
      onToggleComplete={onToggleComplete}
      onDelete={onDelete}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onPress={onTodoPress}
      drag={drag}
      isActive={isActive}
    />
  );

  const activeTodos = todos.filter(todo => !todo.completedAt);
  const completedTodos = todos.filter(todo => !!todo.completedAt);

  const ContainerComponent = Platform.OS === 'web' ? View : BlurView;
  const containerProps = Platform.OS === 'web' ? {} : { intensity: 20 };

  return (
    <ContainerComponent {...containerProps} style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Day Header */}
        <View style={styles.header}>
          <Text style={styles.dayTitle}>{formatDayHeader(date)}</Text>
          <View style={styles.headerRight}>
            {activeTodos.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.todoCount}>{activeTodos.length}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Add Input */}
        {showInput && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddTodo}
              onBlur={handleCancel}
            />
          </View>
        )}

        {/* Active Todos */}
        {activeTodos.length > 0 && (
          <DraggableFlatList
            data={activeTodos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => handleReorderTodos(data)}
            autoscrollThreshold={50}
            activationDistance={20} // Small activation distance for easy dragging
          />
        )}

        {/* Completed Todos (collapsed) */}
        {completedTodos.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedHeader}>
              {completedTodos.length} completed
            </Text>
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onPress={onTodoPress}
              />
            ))}
          </View>
        )}

        {/* Empty state for days with no todos */}
        {todos.length === 0 && !showInput && (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyText}>No todos yet</Text>
          </View>
        )}
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.elevated,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  innerContainer: {
    backgroundColor: theme.colors.todo.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.secondary,
  },
  dayTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: theme.colors.jade.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    minWidth: 28,
    alignItems: 'center',
  },
  todoCount: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.jade.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  addButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.normal,
    lineHeight: 22,
  },
  inputContainer: {
    padding: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.secondary,
  },
  input: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    minHeight: 44,
  },
  completedSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.default,
    backgroundColor: theme.colors.todo.completed,
  },
  completedHeader: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium,
  },
  emptyDay: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
