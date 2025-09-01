import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  useColorScheme,
  Text,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Todo, TodoList } from '../types/todo';
import { todoStore } from '../services/storage';
import { listStore } from '../services/listStorage';
import { ListSection } from '../components/ListSection';
import { ListsManager } from '../components/ListsManager';
import { theme } from '../styles/theme';
import { getStartOfToday } from '../utils/dateUtils';

export const ListsScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showListManager, setShowListManager] = useState(false);
  const colorScheme = useColorScheme();

  // Load todos and lists from storage
  const loadData = useCallback(async () => {
    try {
      const [loadedTodos, loadedLists] = await Promise.all([
        todoStore.getTodos(),
        listStore.getLists(),
      ]);
      setTodos(loadedTodos);
      setLists(loadedLists);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add new todo to a list
  const handleAddTodo = async (title: string, listId: string) => {
    try {
      const today = getStartOfToday();
      
      const newTodo: Todo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        createdAt: new Date(),
        scheduledFor: today,
        deleted: false,
        listId,
      };

      await todoStore.upsert(newTodo);
      await loadData(); // Refresh the list
    } catch (error) {
      console.error('Failed to add todo:', error);
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  // Toggle todo completion
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
      await loadData();
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  // Delete todo
  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      
      // Actual deletion
      await todoStore.softDelete(id);
    } catch (error) {
      console.error('Failed to delete todo:', error);
      // Revert optimistic update on error
      await loadData();
      Alert.alert('Error', 'Failed to delete todo');
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
        await loadData();
      }
    } catch (error) {
      console.error('Failed to edit todo:', error);
      Alert.alert('Error', 'Failed to edit todo');
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
        listId: originalTodo.listId,
      };

      await todoStore.upsert(newTodo);
      await loadData();
    } catch (error) {
      console.error('Failed to duplicate todo:', error);
      Alert.alert('Error', 'Failed to duplicate todo');
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
      await loadData();
      Alert.alert('Error', 'Failed to move todo');
    }
  };

  // Add new list
  const handleAddList = async (name: string, color?: string) => {
    try {
      const newList: TodoList = {
        id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        color,
        createdAt: new Date(),
        deleted: false,
      };

      await listStore.upsert(newList);
      await loadData();
    } catch (error) {
      console.error('Failed to add list:', error);
      Alert.alert('Error', 'Failed to add list');
    }
  };

  // Edit list
  const handleEditList = async (list: TodoList) => {
    try {
      await listStore.upsert(list);
      await loadData();
    } catch (error) {
      console.error('Failed to edit list:', error);
      Alert.alert('Error', 'Failed to edit list');
    }
  };

  // Delete list
  const handleDeleteList = async (id: string) => {
    try {
      await listStore.softDelete(id);
      // Also mark todos in this list as deleted
      const todosInList = todos.filter(todo => todo.listId === id);
      for (const todo of todosInList) {
        await todoStore.softDelete(todo.id);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to delete list:', error);
      Alert.alert('Error', 'Failed to delete list');
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get todos for a specific list
  const getTodosForList = (listId: string): Todo[] => {
    return todos.filter(todo => todo.listId === listId);
  };

  return (
    <LinearGradient
      colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lists</Text>
      </View>
      
      {showListManager ? (
        <ListsManager
          lists={lists}
          onAddList={handleAddList}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
        />
      ) : (
        <FlatList
          data={lists}
          renderItem={({ item: list }) => (
            <ListSection
              list={list}
              todos={getTodosForList(list.id)}
              onAddTodo={(title) => handleAddTodo(title, list.id)}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onMove={handleMoveTodo}
              onEditList={() => handleEditList(list)}
              onDeleteList={() => handleDeleteList(list.id)}
            />
          )}
          keyExtractor={(list) => list.id}
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No lists yet</Text>
              <Text style={styles.emptySubtext}>
                Create lists to organize your todos by categories or projects
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.addListSection}>
              <Text style={styles.addListText}>
                Create and manage your lists to organize todos by project, category, or any way you like.
              </Text>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => setShowListManager(true)}
              >
                <Text style={styles.manageButtonText}>Manage Lists</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text.primary,
    letterSpacing: 3,
    opacity: 0.7,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: theme.spacing.sm, // Reduced since we have header
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  addListSection: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  addListText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  manageButton: {
    backgroundColor: theme.colors.jade.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'center',
  },
  manageButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
  },
});
