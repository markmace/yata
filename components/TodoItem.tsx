import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Swipeable, PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Todo } from '../types/todo';
import { theme } from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

interface TodoItemProps {
  todo: Todo;
  index?: number;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newTitle: string) => void;
  onDuplicate?: (todo: Todo) => void;
  onPress?: (todo: Todo) => void;
  drag?: () => void; // For react-native-draggable-flatlist
  isActive?: boolean; // For react-native-draggable-flatlist
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index = 0,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onPress,
  drag,
  isActive = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useRef(new Animated.Value(1)).current;
  
  const isCompleted = !!todo.completedAt;

  const handlePress = () => {
    if (onPress) {
      onPress(todo);
    }
  };

  const handleToggleComplete = () => {
    // Haptic feedback for completion
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleComplete(todo.id);
    // Close swipeable after action
    swipeableRef.current?.close();
  };

  const handleDelete = () => {
    // Haptic feedback for deletion
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    if (onDelete) {
      onDelete(todo.id);
    }
    swipeableRef.current?.close();
  };

  const handleEdit = () => {
    // Light haptic for edit
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(true);
    swipeableRef.current?.close();
  };

  const handleEditSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== todo.title && onEdit) {
      // Success haptic for save
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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
    // Light haptic for duplicate
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onDuplicate) {
      onDuplicate(todo);
    }
    swipeableRef.current?.close();
  };

  // Scale animation for active drag state
  React.useEffect(() => {
    if (isActive && Platform.OS === 'ios') {
      // Haptic feedback when drag starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Animated.spring(scale, {
      toValue: isActive ? 1.05 : 1,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  // Left action for delete (swipe left to delete)
  const renderLeftAction = (progress: Animated.AnimatedAddition<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
        <Animated.View style={[styles.actionButton, styles.deleteButton, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={handleDelete}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  // Right actions for edit and duplicate (swipe right)
  const renderRightActions = (progress: Animated.AnimatedAddition<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [160, 0], // 2 buttons × 80 width
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.rightActions, { transform: [{ translateX }] }]}>
        <Animated.View style={[styles.actionButton, styles.editButton, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={handleEdit}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.actionButton, styles.duplicateButton, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={handleDuplicate}
          >
            <Text style={styles.duplicateText}>Copy</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  const todoContent = (
    <Animated.View
      style={[
        styles.container,
        isCompleted && styles.completedContainer,
        isActive && styles.draggingContainer,
        {
          transform: [{ scale }],
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

      {/* Reorder Handle */}
      {drag && (
        <TouchableOpacity 
          style={styles.reorderHandle}
          onLongPress={drag}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.reorderIcon}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightActions}
      leftThreshold={30}
      rightThreshold={30}
    >
      {todoContent}
    </Swipeable>
  );


};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
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
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  rightActions: {
    flexDirection: 'row',
    width: 160, // 2 buttons × 80 width
  },
  actionButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: 2,
  },
  actionTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: '#dc2626', // Red-600
  },
  deleteText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  editButton: {
    backgroundColor: theme.colors.jade.main,
  },
  editText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  duplicateButton: {
    backgroundColor: theme.colors.jade.dark,
  },
  duplicateText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
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

  // Reorder handle styles
  reorderHandle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reorderIcon: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.jade.main,
    marginVertical: 1,
  },
});
