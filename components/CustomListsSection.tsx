import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Todo, TodoList } from '../types/todo';
import { TodoItem } from './TodoItem';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

interface CustomListsSectionProps {
  lists: TodoList[];
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDuplicate: (todo: Todo) => void;
  onMove?: (todo: Todo, newDate: Date) => void;
  onReorderTodos?: (todos: Todo[]) => void;
}

export const CustomListsSection: React.FC<CustomListsSectionProps> = ({
  lists,
  todos,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onMove,
  onReorderTodos,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigation = useNavigation();

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Get todos for a specific list
  const getTodosForList = (listId: string): Todo[] => {
    return todos.filter(todo => todo.listId === listId);
  };

  // Count todos across all lists
  const listTodoCount = lists.reduce((count, list) => {
    return count + getTodosForList(list.id).filter(todo => !todo.completedAt).length;
  }, 0);

  const handleManageLists = () => {
    navigation.navigate('Lists' as never);
  };

  const ContainerComponent = Platform.OS === 'web' ? View : BlurView;
  const containerProps = Platform.OS === 'web' ? {} : { intensity: 20 };

  if (lists.length === 0) {
    return null; // Don't show section if there are no lists
  }

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
            <Text style={styles.title}>My Lists</Text>
          </View>
          <View style={styles.headerRight}>
            {listTodoCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.todoCount}>{listTodoCount}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageLists}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="edit"
                size={18}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Lists */}
        {isExpanded && (
          <FlatList
            data={lists}
            renderItem={({ item: list }) => {
              const listTodos = getTodosForList(list.id);
              if (listTodos.length === 0) return null;

              return (
                <View style={styles.listContainer}>
                  <Text style={styles.listName}>{list.name}</Text>
                  {listTodos.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onMove={onMove}
                    />
                  ))}
                </View>
              );
            }}
            keyExtractor={(list) => list.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No lists created yet</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleManageLists}
                >
                  <Text style={styles.createButtonText}>Create Lists</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.elevated,
    marginBottom: theme.spacing.md,
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
  countBadge: {
    backgroundColor: theme.colors.jade.dark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    minWidth: 28,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  todoCount: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  manageButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  listContainer: {
    padding: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
  },
  listName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  createButton: {
    backgroundColor: theme.colors.jade.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
  },
});
