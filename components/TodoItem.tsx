import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Todo } from '../types/todo';
import { theme } from '../styles/theme';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  onPress?: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onPress,
}) => {
  const isCompleted = !!todo.completedAt;

  const handlePress = () => {
    if (onPress) {
      onPress(todo);
    }
  };

  const handleToggleComplete = () => {
    onToggleComplete(todo.id);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(todo.id);
    }
  };

  // Right action for delete
  const renderRightAction = (progress: Animated.AnimatedAddition) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Left action for complete
  const renderLeftAction = (progress: Animated.AnimatedAddition) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.completeAction, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleToggleComplete}
        >
          <Text style={styles.completeText}>
            {isCompleted ? 'Undo' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const todoContent = (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={handleToggleComplete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.completedTitle,
          ]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderLeftActions={renderLeftAction}
      renderRightActions={onDelete ? renderRightAction : undefined}
    >
      {todoContent}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.transparent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
    minHeight: 60,
  },
  completedContainer: {
    opacity: theme.opacity.muted,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.jade.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
    backgroundColor: theme.colors.transparent,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.jade.main,
    borderColor: theme.colors.jade.main,
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.sizes.base,
    letterSpacing: -0.1,
    fontWeight: theme.typography.weights.normal,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.tertiary,
  },
  // Swipe action styles
  deleteAction: {
    flex: 1,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.lg,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
  completeAction: {
    flex: 1,
    backgroundColor: theme.colors.jade.main,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: theme.spacing.lg,
  },
  completeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  completeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
});
