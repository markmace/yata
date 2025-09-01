import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  useColorScheme,
  Platform,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo } from '../types/todo';
import { todoStore } from '../services/storage';
import { DaySection } from '../components/DaySection';
import { LongTermSection } from '../components/LongTermSection';
import { theme } from '../styles/theme';
import {
  getStartOfToday,
  generateDaySequence,
  isSameDay,
  isOverdue,
} from '../utils/dateUtils';

export const MainScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLongTerm, setShowLongTerm] = useState(true);
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

  // Check for overdue todos and handle rollover
  useEffect(() => {
    const checkOverdueTodos = async () => {
      if (todos.length === 0) return;
      
      const today = getStartOfToday();
      const overdueTodos = todos.filter(todo => 
        !todo.completedAt && 
        !todo.longTerm && 
        isOverdue(todo.scheduledFor)
      );
      
      if (overdueTodos.length > 0) {
        // Ask user if they want to roll over overdue todos
        Alert.alert(
          'Overdue Todos',
          `You have ${overdueTodos.length} overdue todo${overdueTodos.length > 1 ? 's' : ''}. Would you like to move them to today?`,
          [
            {
              text: 'No',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: async () => {
                // Update all overdue todos to today
                for (const todo of overdueTodos) {
                  const updatedTodo = {
                    ...todo,
                    scheduledFor: today,
                  };
                  await todoStore.upsert(updatedTodo);
                }
                await loadTodos();
                Alert.alert('Success', 'Overdue todos have been moved to today');
              },
            },
          ],
        );
      }
    };
    
    checkOverdueTodos();
  }, [todos]);

  // Add new todo to specific date
  const handleAddTodo = async (title: string, scheduledFor: Date, isLongTerm = false) => {
    try {
      const newTodo: Todo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        createdAt: new Date(),
        scheduledFor,
        deleted: false,
        longTerm: isLongTerm,
      };

      await todoStore.upsert(newTodo);
      await loadTodos(); // Refresh the list
    } catch (error) {
      console.error('Failed to add todo:', error);
      Alert.alert('Error', 'Failed to add todo');
    }
  };
  
  // Add long-term todo
  const handleAddLongTermTodo = async (title: string, scheduledFor: Date) => {
    await handleAddTodo(title, scheduledFor, true);
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

  // Delete todo immediately with optimistic update
  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      
      // Actual deletion
      await todoStore.softDelete(id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      // Revert optimistic update on error
      await loadTodos();
      if (Platform.OS === 'web') {
        alert('Error: Failed to delete todo');
      } else {
        Alert.alert('Error', 'Failed to delete todo');
      }
    }
  };

  // Edit todo
  const handleEdit = async (id: string, newTitle: string) => {
    try {
      const todo = await todoStore.getTodo(id);
      if (todo) {
        const updatedTodo = {
          ...todo,
          title: newTitle,
        };
        await todoStore.upsert(updatedTodo);
        await loadTodos();
      }
    } catch (error) {
      console.error('Failed to edit todo:', error);
      Alert.alert('Error', 'Failed to edit todo');
    }
  };

  // Toggle todo long-term status
  const handleToggleLongTerm = async (todo: Todo) => {
    try {
      // Optimistic update
      setTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === todo.id
            ? {
                ...t,
                longTerm: !t.longTerm,
              }
            : t
        )
      );

      // Actual update
      const updatedTodo = {
        ...todo,
        longTerm: !todo.longTerm,
      };
      await todoStore.upsert(updatedTodo);
    } catch (error) {
      console.error('Failed to toggle long-term status:', error);
      // Revert optimistic update on error
      await loadTodos();
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  // Move todo to different date
  const handleMoveTodo = async (todo: Todo, newDate: Date) => {
    try {
      // Optimistic update
      setTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === todo.id
            ? {
                ...t,
                scheduledFor: newDate,
              }
            : t
        )
      );

      // Actual update
      const updatedTodo = {
        ...todo,
        scheduledFor: newDate,
      };
      await todoStore.upsert(updatedTodo);
    } catch (error) {
      console.error('Failed to move todo:', error);
      // Revert optimistic update on error
      await loadTodos();
      Alert.alert('Error', 'Failed to move todo');
    }
  };

  // Reorder todos within a day
  const handleReorderTodos = async (reorderedTodos: Todo[]) => {
    try {
      // Update all todos with new order
      const updates = reorderedTodos.map((todo, index) => ({
        ...todo,
        // Add an order field or use createdAt to maintain order
        createdAt: new Date(Date.now() + index), // Simple ordering trick
      }));
      
      for (const todo of updates) {
        await todoStore.upsert(todo);
      }
      
      await loadTodos();
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      Alert.alert('Error', 'Failed to reorder todos');
    }
  };

  // Duplicate todo
  const handleDuplicate = async (originalTodo: Todo) => {
    try {
      const newTodo: Todo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: originalTodo.title,
        notes: originalTodo.notes,
        createdAt: new Date(),
        scheduledFor: originalTodo.scheduledFor,
        deleted: false,
      };

      await todoStore.upsert(newTodo);
      await loadTodos();
    } catch (error) {
      console.error('Failed to duplicate todo:', error);
      Alert.alert('Error', 'Failed to duplicate todo');
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  };

  // Get todos for a specific day
  const getTodosForDay = (date: Date): Todo[] => {
    return todos.filter(todo => !todo.longTerm && isSameDay(todo.scheduledFor, date));
  };

  // Get long-term todos
  const getLongTermTodos = (): Todo[] => {
    return todos.filter(todo => todo.longTerm);
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
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onMove={handleMoveTodo}
        onReorderTodos={handleReorderTodos}
      />
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Logo Header */}
      <View style={styles.header}>
        <Image
          source={colorScheme === 'dark' ? require('../assets/yata_logo_light_text.png') : require('../assets/yata_logo_dark_text.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <FlatList
        data={days}
        ListHeaderComponent={
          <LongTermSection
            todos={getLongTermTodos()}
            onAddTodo={handleAddLongTermTodo}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onMove={handleMoveTodo}
            onToggleLongTerm={handleToggleLongTerm}
            onReorderTodos={handleReorderTodos}
          />
        }
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
  header: {
    paddingTop: 60, // Account for status bar
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: Dimensions.get('window').width * 0.3,
    opacity: 0.9,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: theme.spacing.sm, // Reduced since we have header
  },
});
