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
    backgroundColor: '#ffffff',
    padding: Platform.OS === 'ios' ? 16 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
    minHeight: 60,
  },
  completedContainer: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  // Swipe action styles
  deleteAction: {
    flex: 1,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeAction: {
    flex: 1,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  completeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  completeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
