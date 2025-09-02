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
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TodoDatePicker } from './TodoDatePicker';
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
  onMove?: (todo: Todo, newDate: Date) => void;
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
  onMove,
  onPress,
  drag,
  isActive = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useRef(new Animated.Value(1)).current;
  
  const isCompleted = !!todo.completedAt;
  const isLongTerm = !!todo.longTerm;

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

  const handleMove = () => {
    // Light haptic for move
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDatePicker(true);
    swipeableRef.current?.close();
  };

  const handleSelectDate = (date: Date) => {
    if (onMove) {
      onMove(todo, date);
    }
  };

  // Scale animation for active drag state
  React.useEffect(() => {
    if (isActive && Platform.OS === 'ios') {
      // Haptic feedback when drag starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Don't animate scale here since we're using transform in the style
    // This prevents conflicts between animated values
    Animated.spring(scale, {
      toValue: 1, // Keep scale at 1 since we're handling it in the style
      useNativeDriver: true,
      tension: 300,
      friction: 20,
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
            <MaterialIcons name="delete" size={22} color="#ffffff" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  // Right actions for edit, duplicate, and move (swipe right)
  const renderRightActions = (progress: Animated.AnimatedAddition<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [240, 0], // 3 buttons × 80 width
      extrapolate: 'clamp',
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.rightActions, { transform: [{ translateX }] }]}>
        <Animated.View style={[styles.actionButton, styles.moveButton, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={handleMove}
          >
            <MaterialIcons name="calendar-today" size={22} color="#ffffff" />
            <Text style={styles.moveText}>Move</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.actionButton, styles.editButton, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={handleEdit}
          >
            <MaterialIcons name="edit" size={22} color="#ffffff" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.actionButton, styles.duplicateButton, { transform: [{ scale }] }]}>
          <TouchableOpacity
            style={styles.actionTouchable}
            onPress={handleDuplicate}
          >
            <Ionicons name="copy-outline" size={22} color="#ffffff" />
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
        isLongTerm && styles.longTermContainer,
        isActive && styles.draggingContainer,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
                    style={[
              styles.checkbox, 
              isCompleted && styles.checkboxCompleted,
              isLongTerm && styles.checkboxLongTerm
            ]}
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
              isLongTerm && styles.longTermTitle,
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
          onPressIn={drag} // Use onPressIn for immediate activation
          activeOpacity={0.5}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <View style={[
            styles.reorderIcon,
            isActive && styles.activeReorderIcon
          ]}>
            <MaterialIcons 
              name="drag-handle" 
              size={28} 
              color={isActive ? theme.colors.jade.main : theme.colors.text.secondary} 
            />
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  // Allow both drag-and-drop and swipe gestures to work together
  // The drag handle is on the right side, swipe gestures work on the main content
  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftAction}
        renderRightActions={renderRightActions}
        friction={2}
        leftThreshold={40}
        rightThreshold={40}
        overshootLeft={false}
        overshootRight={false}
      >
        {todoContent}
      </Swipeable>

      {/* Date Picker Modal */}
      <TodoDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleSelectDate}
        currentDate={todo.scheduledFor}
        todoTitle={todo.title}
      />
    </>
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
    shadowRadius: 5,
    elevation: 8,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    zIndex: 999, // Ensure it appears above other items
    width: '100%', // Maintain width when dragging
    borderWidth: 1,
    borderColor: theme.colors.jade.main,
    transform: [{ scale: 1.02 }], // Slight scale effect
  },
  longTermContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.jade.dark,
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
  checkboxLongTerm: {
    borderColor: theme.colors.jade.dark,
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
  longTermTitle: {
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.jade.dark,
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
    width: 240, // 3 buttons × 80 width
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
    paddingVertical: theme.spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: theme.colors.actions.delete,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 4,
  },
  editButton: {
    backgroundColor: theme.colors.actions.edit,
  },
  editText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 4,
  },
  duplicateButton: {
    backgroundColor: theme.colors.actions.copy,
  },
  duplicateText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 4,
  },
  moveButton: {
    backgroundColor: theme.colors.actions.move,
  },
  moveText: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginTop: 4,
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
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginLeft: theme.spacing.sm,
    minWidth: 44, // Increased touch target
    minHeight: 44, // Increased touch target
  },
  reorderIcon: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    padding: 2,
  },
  activeReorderIcon: {
    backgroundColor: theme.colors.jade.light,
    borderWidth: 1,
    borderColor: theme.colors.jade.main,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 12,
    marginVertical: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text.primary,
    marginVertical: 1.5,
  },
});
