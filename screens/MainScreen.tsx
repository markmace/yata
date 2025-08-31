import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo } from '../types/todo';
import { todoStore } from '../services/storage';
import { DaySection } from '../components/DaySection';
import { theme } from '../styles/theme';
import {
  getStartOfToday,
  generateDaySequence,
  isSameDay,
} from '../utils/dateUtils';

export const MainScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();

  // Generate 30 days starting from today
  const days = generateDaySequence(getStartOfToday(), 30);

  // Load todos from storage
  const loadTodos = useCallback(async () => {
    try {
      const loadedTodos = await todoStore.getTodos();
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
      Alert.alert('Error', 'Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Add new todo to specific date
  const handleAddTodo = async (title: string, scheduledFor: Date) => {
    try {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title,
        createdAt: new Date(),
        scheduledFor,
        deleted: false,
      };

      await todoStore.upsert(newTodo);
      await loadTodos(); // Refresh the list
    } catch (error) {
      console.error('Failed to add todo:', error);
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  // Toggle todo completion with optimistic updates
  const handleToggleComplete = async (id: string) => {
    try {
      // Optimistic update
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id
            ? {
                ...todo,
                completedAt: todo.completedAt ? undefined : new Date(),
              }
            : todo
        )
      );

      // Get the todo and update it
      const todo = await todoStore.getTodo(id);
      if (todo) {
        const updatedTodo = {
          ...todo,
          completedAt: todo.completedAt ? undefined : new Date(),
        };
        await todoStore.upsert(updatedTodo);
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      // Revert optimistic update on error
      await loadTodos();
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  // Delete todo with confirmation
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await todoStore.softDelete(id);
              await loadTodos();
            } catch (error) {
              console.error('Failed to delete todo:', error);
              Alert.alert('Error', 'Failed to delete todo');
            }
          },
        },
      ]
    );
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  };

  // Get todos for a specific day
  const getTodosForDay = (date: Date): Todo[] => {
    return todos.filter(todo => isSameDay(todo.scheduledFor, date));
  };

  const renderDaySection = ({ item: date }: { item: Date }) => {
    const dayTodos = getTodosForDay(date);
    
    return (
      <DaySection
        date={date}
        todos={dayTodos}
        onAddTodo={handleAddTodo}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
      style={styles.container}
    >
      <StatusBar style="dark" />
      
      <FlatList
        data={days}
        renderItem={renderDaySection}
        keyExtractor={(date) => date.toISOString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.jade.main}
            progressBackgroundColor={theme.colors.background.elevated}
          />
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: theme.spacing.xl,
  },
});
