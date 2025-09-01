import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { BlurView } from 'expo-blur';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Todo, TodoList } from '../types/todo';
import { TodoItem } from './TodoItem';
import { theme } from '../styles/theme';

interface ListSectionProps {
  list: TodoList;
  todos: Todo[];
  onAddTodo: (title: string, listId: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDuplicate: (todo: Todo) => void;
  onMove?: (todo: Todo, newDate: Date) => void;
  onReorderTodos?: (todos: Todo[]) => void;
  onTodoPress?: (todo: Todo) => void;
  onEditList?: (list: TodoList) => void;
  onDeleteList?: (id: string) => void;
}

export const ListSection: React.FC<ListSectionProps> = ({
  list,
  todos,
  onAddTodo,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onMove,
  onReorderTodos,
  onTodoPress,
  onEditList,
  onDeleteList,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddTodo = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAddTodo(trimmedValue, list.id);
      setInputValue('');
      setShowInput(false);
    }
  };

  const handleAddPress = () => {
    setShowInput(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderTodoItem = ({ item: todo, drag, isActive }: RenderItemParams<Todo>) => (
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

  const activeTodos = todos.filter(todo => !todo.completedAt);
  const completedTodos = todos.filter(todo => !!todo.completedAt);

  const listColor = list.color || theme.colors.jade.main;
  
  const ContainerComponent = Platform.OS === 'web' ? View : BlurView;
  const containerProps = Platform.OS === 'web' ? {} : { intensity: 20 };

  return (
    <ContainerComponent {...containerProps} style={styles.container}>
      <View style={[styles.innerContainer, { borderLeftColor: listColor, borderLeftWidth: 4 }]}>
        {/* List Header */}
        <TouchableOpacity 
          style={styles.header}
          onPress={toggleCollapse}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <MaterialIcons 
              name={isCollapsed ? "keyboard-arrow-right" : "keyboard-arrow-down"} 
              size={24} 
              color={theme.colors.text.primary} 
            />
            <Text style={styles.title}>{list.name}</Text>
          </View>
          
          <View style={styles.headerRight}>
            {activeTodos.length > 0 && !isCollapsed && (
              <View style={[styles.countBadge, { backgroundColor: listColor }]}>
                <Text style={styles.todoCount}>{activeTodos.length}</Text>
              </View>
            )}
            
            {!isCollapsed && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: listColor }]}
                onPress={handleAddPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            )}
            
            {onEditList && (
              <TouchableOpacity
                style={styles.editListButton}
                onPress={() => onEditList(list)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="more-vert" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {!isCollapsed && (
          <>
            {/* Quick Add Input */}
            {showInput && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={`Add to ${list.name}...`}
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

            {/* Empty state */}
            {todos.length === 0 && !showInput && (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No items in this list</Text>
              </View>
            )}
          </>
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
    backgroundColor: theme.colors.background.primary,
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
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
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
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  addButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.normal,
    lineHeight: 22,
  },
  editListButton: {
    marginLeft: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  inputContainer: {
    padding: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
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
  emptySection: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
