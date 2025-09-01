import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  onMove?: (todo: Todo, newDate: Date) => void;
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
  onMove,
  onReorderTodos,
  onTodoPress,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
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

  const activeTodos = todos.filter(todo => !todo.completedAt);
  const completedTodos = todos.filter(todo => !!todo.completedAt);

  const handleReorderTodos = useCallback((data: Todo[]) => {
    if (!onReorderTodos) return;
    
    // Log the reordered data
    console.log(`Reordering ${data.length} todos for ${formatDayHeader(date)}`);
    
    // Assign sortOrder to each todo based on its position
    const reorderedTodos = data.map((todo, index) => ({
      ...todo,
      sortOrder: index
    }));
    
    // Combine with completed todos (keeping completed todos at the end)
    const allTodos = [...reorderedTodos, ...completedTodos];
    
    // Call the parent handler
    onReorderTodos(allTodos);
  }, [onReorderTodos, completedTodos, date]);

  // Remove drag mode toggle - not needed anymore

  const renderTodoItem = useCallback(({ item: todo, drag, isActive }: RenderItemParams<Todo>) => {
    // Log to verify drag function is being passed correctly
    console.log(`Rendering todo item: ${todo.id}, drag function available: ${!!drag}`);
    
    return (
      <TodoItem
        todo={todo}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onMove={onMove}
        onPress={onTodoPress}
        drag={drag}
        isActive={isActive}
      />
    );
  }, [onToggleComplete, onDelete, onEdit, onDuplicate, onMove, onTodoPress]);

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
            containerStyle={styles.dragContainer}
            activationDistance={5}
            dragItemOverflow={true}
            autoscrollSpeed={50}
            autoscrollThreshold={50}
          />
        )}

        {/* Completed Todos (collapsible) */}
        {completedTodos.length > 0 && (
          <View style={styles.completedSection}>
            <TouchableOpacity 
              style={styles.completedHeaderContainer}
              onPress={() => setShowCompleted(!showCompleted)}
              activeOpacity={0.7}
            >
              <Text style={styles.completedHeader}>
                {completedTodos.length} completed
              </Text>
              <MaterialIcons 
                name={showCompleted ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={22} 
                color={theme.colors.text.secondary} 
              />
            </TouchableOpacity>
            
            {showCompleted && completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onMove={onMove}
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
  completedHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
  },
  completedHeader: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
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
  dragContainer: {
    width: '100%',
    overflow: 'visible', // Allow items to overflow during dragging
    minHeight: 10, // Ensure container has some height even when empty
  },
});
