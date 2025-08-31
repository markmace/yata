import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Swipeable, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Todo } from '../types/todo';
import { theme } from '../styles/theme';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newTitle: string) => void;
  onDuplicate?: (todo: Todo) => void;
  onPress?: (todo: Todo) => void;
  isDragEnabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onPress,
  isDragEnabled = false,
  onDragStart,
  onDragEnd,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const [isDragging, setIsDragging] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
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
    setShowMenu(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== todo.title && onEdit) {
      onEdit(todo.id, trimmedText);
    }
    setIsEditing(false);
    setEditText(todo.title);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(todo.title);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(todo);
    }
    setShowMenu(false);
  };

  const handleLongPress = () => {
    setShowMenu(!showMenu);
    // Close swipeable if it's open
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };

  const handlePanGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handlePanStateChange = (event: any) => {
    if (!isDragEnabled) return;

    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
      onDragStart?.();
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      setIsDragging(false);
      onDragEnd?.();
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Right action for delete
  const renderRightAction = (progress: Animated.AnimatedAddition<number>) => {
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
  const renderLeftAction = (progress: Animated.AnimatedAddition<number>) => {
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
    <Animated.View
      style={[
        styles.container,
        isCompleted && styles.completedContainer,
        isDragging && styles.draggingContainer,
        {
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={handleToggleComplete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={handleEditSave}
              onBlur={handleEditCancel}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
            />
          </View>
        ) : (
          <Text
            style={[
              styles.title,
              isCompleted && styles.completedTitle,
            ]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>
        )}
      </TouchableOpacity>

      {/* Drag Handle */}
      <TouchableOpacity style={styles.dragHandle}>
        <Text style={styles.dragIcon}>⋮⋮</Text>
      </TouchableOpacity>

      {/* Drag Handle (visible when drag is enabled) */}
      {isDragEnabled && (
        <View style={styles.dragHandle}>
          <Text style={styles.dragIcon}>⋮⋮</Text>
        </View>
      )}
    </Animated.View>
  );

  if (Platform.OS === 'web') {
    // Simplified version for web without gesture handlers
    return todoContent;
  }

  return (
    <PanGestureHandler
      enabled={isDragEnabled}
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanStateChange}
    >
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftAction}
        renderRightActions={onDelete ? renderRightAction : undefined}
        enabled={!isDragging}
      >
        {todoContent}
      </Swipeable>
    </PanGestureHandler>
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
  draggingContainer: {
    shadowColor: theme.colors.jade.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
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
  // Edit functionality styles
  editContainer: {
    flex: 1,
  },
  editInput: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.jade.main,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.primary,
    minHeight: 36,
  },
  // Hamburger menu styles
  menuContainer: {
    position: 'relative',
  },
  hamburgerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  hamburgerIcon: {
    width: 16,
    height: 12,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 16,
    height: 2,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
    minWidth: 120,
  },
  menuItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  deleteMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
  },
  deleteMenuText: {
    color: theme.colors.error,
  },
  // Drag handle styles
  dragHandle: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIcon: {
    fontSize: 16,
    color: theme.colors.text.tertiary,
    lineHeight: 16,
    letterSpacing: -2,
  },
});
