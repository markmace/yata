import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Todo } from '../types/todo';
import { todoStore } from '../services/storage';
import { DaySection } from '../components/DaySection';
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
  const colorScheme = useColorScheme();

  // Generate days for past, present, and future
  const today = getStartOfToday();
  const pastDays = generateDaySequence(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), 14).reverse();
  const futureDays = generateDaySequence(today, 30);
  
  // State for past days scrolling
  const [showingPastDays, setShowingPastDays] = useState(false);

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

  // State for rollover UI
  const [showRolloverUI, setShowRolloverUI] = useState(false);
  const [overdueTodos, setOverdueTodos] = useState<Todo[]>([]);
  
  // Check for overdue todos and handle rollover
  useEffect(() => {
    const checkOverdueTodos = async () => {
      if (todos.length === 0) return;
      
      const today = getStartOfToday();
      const overdueItems = todos.filter(todo => 
        !todo.completedAt && 
        !todo.longTerm && 
        isOverdue(todo.scheduledFor)
      );
      
      if (overdueItems.length > 0) {
        setOverdueTodos(overdueItems);
        // Show rollover UI if there are overdue todos
        setShowRolloverUI(true);
      } else {
        setOverdueTodos([]);
        setShowRolloverUI(false);
      }
    };
    
    checkOverdueTodos();
  }, [todos]);
  
  // Handle rollover of a single overdue todo to today
  const handleRolloverSingleToToday = async (todo: Todo) => {
    try {
      const today = getStartOfToday();
      
      // Update the todo to today
      const updatedTodo = {
        ...todo,
        scheduledFor: today,
      };
      await todoStore.upsert(updatedTodo);
      
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Remove this todo from the overdue list
      setOverdueTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
      await loadTodos();
      
      // If no more overdue todos, hide the UI
      if (overdueTodos.length <= 1) {
        setShowRolloverUI(false);
      }
    } catch (error) {
      console.error('Failed to roll over todo:', error);
      Alert.alert('Error', 'Failed to roll over todo');
    }
  };
  
  // Mark a single overdue todo as completed
  const handleMarkSingleComplete = async (todo: Todo) => {
    try {
      // Mark the todo as completed
      const updatedTodo = {
        ...todo,
        completedAt: new Date(),
      };
      await todoStore.upsert(updatedTodo);
      
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Remove this todo from the overdue list
      setOverdueTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
      await loadTodos();
      
      // If no more overdue todos, hide the UI
      if (overdueTodos.length <= 1) {
        setShowRolloverUI(false);
      }
    } catch (error) {
      console.error('Failed to mark todo as completed:', error);
      Alert.alert('Error', 'Failed to mark todo as completed');
    }
  };
  
  // Disregard a single overdue todo (leave it in the past)
  const handleDisregardSingle = async (todo: Todo) => {
    try {
      // Remove this todo from the overdue list without changing its status
      setOverdueTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
      
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // If no more overdue todos, hide the UI
      if (overdueTodos.length <= 1) {
        setShowRolloverUI(false);
      }
    } catch (error) {
      console.error('Failed to disregard todo:', error);
      Alert.alert('Error', 'Failed to process todo');
    }
  };
  
  // Dismiss rollover UI without taking action
  const handleDismissRollover = () => {
    setShowRolloverUI(false);
  };

  // Add new todo to specific date
  const handleAddTodo = async (title: string, scheduledFor: Date) => {
    try {
      const newTodo: Todo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

      // Provide haptic feedback for successful move
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Actual update
      const updatedTodo = {
        ...todo,
        scheduledFor: newDate,
      };
      await todoStore.upsert(updatedTodo);
    } catch (error) {
      console.error('Failed to move todo:', error);
      // Provide haptic feedback for error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      // Revert optimistic update on error
      await loadTodos();
      Alert.alert('Error', 'Failed to move todo');
    }
  };

  // Reorder todos within a day
  const handleReorderTodos = async (reorderedTodos: Todo[]) => {
    try {
      console.log('Reordering todos:', reorderedTodos.map(t => t.title));
      
      // Create a map of the reordered todos with updated sortOrder
      const updates = reorderedTodos.map((todo, index) => ({
        ...todo,
        sortOrder: index,
        updatedAt: new Date()
      }));
      
      // Optimistic update for immediate UI feedback
      setTodos(prevTodos => {
        const reorderedMap = new Map(updates.map(todo => [todo.id, todo]));
        
        return prevTodos.map(todo => 
          reorderedMap.has(todo.id) ? reorderedMap.get(todo.id)! : todo
        );
      });
      
      // Batch update to storage
      for (const todo of updates) {
        await todoStore.upsert(todo);
      }
      
      // Provide haptic feedback for successful reordering
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Reload todos to ensure consistency with storage
      await loadTodos();
      
      console.log('Reordering completed successfully');
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      // Reload todos to revert to correct state in case of error
      await loadTodos();
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
      
      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, !showingPastDays && styles.activeTab]} 
          onPress={() => {
            setShowingPastDays(false);
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Text style={[styles.tabText, !showingPastDays && styles.activeTabText]}>
            Future
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, showingPastDays && styles.activeTab]}
          onPress={() => {
            setShowingPastDays(true);
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Text style={[styles.tabText, showingPastDays && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Rollover UI */}
      {showRolloverUI && (
        <View style={styles.rolloverContainer}>
          <View style={styles.rolloverHeader}>
            <MaterialIcons name="warning" size={24} color="#f59e0b" /* amber-500 */ />
            <Text style={styles.rolloverTitle}>
              {overdueTodos.length} Overdue {overdueTodos.length === 1 ? 'Task' : 'Tasks'}
            </Text>
            <TouchableOpacity onPress={handleDismissRollover} style={styles.dismissButton}>
              <MaterialIcons name="close" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.overdueList}>
            {overdueTodos.map((todo) => (
              <View key={todo.id} style={styles.overdueItemContainer}>
                <View style={styles.overdueItem}>
                  <MaterialIcons name="event-busy" size={16} color="#f59e0b" /* amber-500 */ />
                  <Text style={styles.overdueItemText} numberOfLines={1} ellipsizeMode="tail">
                    {todo.title}
                  </Text>
                </View>
                
                <View style={styles.overdueItemActions}>
                  <TouchableOpacity 
                    style={styles.overdueItemAction}
                    onPress={() => handleRolloverSingleToToday(todo)}
                  >
                    <MaterialIcons name="today" size={20} color={theme.colors.jade.main} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.overdueItemAction}
                    onPress={() => handleMarkSingleComplete(todo)}
                  >
                    <MaterialIcons name="check" size={20} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.overdueItemAction}
                    onPress={() => handleDisregardSingle(todo)}
                  >
                    <MaterialIcons name="close" size={20} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.rolloverLegend}>
            <View style={styles.legendItem}>
              <MaterialIcons name="today" size={16} color={theme.colors.jade.main} />
              <Text style={styles.legendText}>Move to Today</Text>
            </View>
            <View style={styles.legendItem}>
              <MaterialIcons name="check" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.legendText}>Mark Complete</Text>
            </View>
            <View style={styles.legendItem}>
              <MaterialIcons name="close" size={16} color={theme.colors.text.tertiary} />
              <Text style={styles.legendText}>Disregard</Text>
            </View>
          </View>
        </View>
      )}
      

      
      <FlatList
        data={showingPastDays ? pastDays : futureDays}
        ListHeaderComponent={showingPastDays ? (
          <View style={styles.pastDaysHeader}>
            <Text style={styles.pastDaysHeaderText}>
              Showing previous {pastDays.length} days
            </Text>
          </View>
        ) : null}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.jade.main,
  },
  tabText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.semibold,
  },
  pastDaysHeader: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: theme.borderRadius.md,
  },
  pastDaysHeaderText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  rolloverContainer: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b", /* amber-500 */
  },
  rolloverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rolloverTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  dismissButton: {
    padding: theme.spacing.xs,
  },
  overdueList: {
    marginBottom: theme.spacing.md,
  },
  overdueItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  overdueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  overdueItemText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  overdueItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueItemAction: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  rolloverLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs,
  },
});
