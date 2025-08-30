import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';
import { formatDayHeader } from '../utils/dateUtils';

interface DaySectionProps {
  date: Date;
  todos: Todo[];
  onAddTodo: (title: string, date: Date) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onTodoPress?: (todo: Todo) => void;
}

export const DaySection: React.FC<DaySectionProps> = ({
  date,
  todos,
  onAddTodo,
  onToggleComplete,
  onDelete,
  onTodoPress,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

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

  return (
    <View style={styles.container}>
      {/* Day Header */}
      <View style={styles.header}>
        <Text style={styles.dayTitle}>{formatDayHeader(date)}</Text>
        <View style={styles.headerRight}>
          {activeTodos.length > 0 && (
            <Text style={styles.todoCount}>{activeTodos.length}</Text>
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
            placeholderTextColor="#999999"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAddTodo}
            onBlur={handleCancel}
          />
        </View>
      )}

      {/* Active Todos */}
      {activeTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onPress={onTodoPress}
        />
      ))}

      {/* Completed Todos (collapsed) */}
      {completedTodos.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedHeader}>
            ✓ {completedTodos.length} completed
          </Text>
          {completedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoCount: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#f8f9fa',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  completedSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e1e1e1',
    backgroundColor: '#f8f9fa',
  },
  completedHeader: {
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  emptyDay: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});
