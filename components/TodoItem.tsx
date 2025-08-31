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
  index?: number;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newTitle: string) => void;
  onDuplicate?: (todo: Todo) => void;
  onPress?: (todo: Todo) => void;
  isDragEnabled?: boolean;
  isBeingDragged?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: () => void;
  onDrop?: (fromIndex: number) => void;
  onShowMenu?: (todo: Todo, menuRef: any) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index = 0,
  onToggleComplete,
  onDelete,
  onEdit,
  onDuplicate,
  onPress,
  isDragEnabled = false,
  isBeingDragged = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onShowMenu,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const [isDragging, setIsDragging] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  const menuButtonRef = useRef<TouchableOpacity>(null);
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
    console.log('Delete clicked for todo:', todo.id);
    console.log('onDelete function:', onDelete);
    if (onDelete) {
      console.log('Calling onDelete with id:', todo.id);
      onDelete(todo.id);
      console.log('onDelete called successfully');
    } else {
      console.log('ERROR: onDelete is not defined');
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
    console.log('Duplicate clicked for todo:', todo.id);
    console.log('onDuplicate function:', onDuplicate);
    if (onDuplicate) {
      console.log('Calling onDuplicate with todo:', todo);
      onDuplicate(todo);
      console.log('onDuplicate called successfully');
    } else {
      console.log('ERROR: onDuplicate is not defined');
    }
    setShowMenu(false);
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
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
        isBeingDragged && styles.beingDraggedContainer,
        isDragOver && styles.dragOverContainer,
        {
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
      onTouchStart={isDragEnabled ? () => {
        setIsDragging(true);
        onDragStart?.();
      } : undefined}
      onTouchEnd={isDragEnabled ? () => {
        setIsDragging(false);
        onDragEnd?.();
      } : undefined}
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

      {/* Drag Handle or Menu Button */}
      {isDragEnabled ? (
        <TouchableOpacity 
          style={styles.dragHandle}
          onLongPress={() => {
            // Handle drag with long press
            onDragStart?.();
          }}
        >
          <Text style={styles.dragIcon}>⋮⋮</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          ref={menuButtonRef}
          style={styles.menuButton} 
          onPress={() => {
            if (menuButtonRef.current) {
              menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
                setMenuPosition({ 
                  x: pageX + width, 
                  y: pageY + height 
                });
                setShowMenu(!showMenu);
              });
            } else {
              // Fallback if measure doesn't work
              setShowMenu(!showMenu);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      )}

    </Animated.View>
  );

  // Just use Modal - it renders outside the component tree
  return (
    <View>
      {todoContent}
      
      {/* Modal renders at app root level - won't be clipped */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.modalContent}>
            <View style={[styles.contextMenu, {
              position: 'absolute',
              top: menuPosition.y,
              left: Math.max(10, menuPosition.x - 120), // Keep menu on screen
            }]}>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDuplicate}>
                <Text style={styles.menuText}>Duplicate</Text>
              </TouchableOpacity>
              {onDelete && (
                <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                  <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
  beingDraggedContainer: {
    opacity: 0.7,
    transform: [{ scale: 1.02 }],
    shadowColor: theme.colors.jade.main,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  dragOverContainer: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.jade.main,
    backgroundColor: theme.colors.jade.light + '20', // 20% opacity
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
  // Modal menu styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContent: {
    flex: 1,
    position: 'relative',
  },
  contextMenu: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 140,
    paddingVertical: theme.spacing.xs,
  },
  menuItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  menuText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
  },
  deleteText: {
    color: theme.colors.error,
  },
  // Menu button styles
  menuButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.bold,
  },
  // Drag handle styles
  dragHandle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIcon: {
    fontSize: 18,
    color: theme.colors.jade.main,
    lineHeight: 18,
    letterSpacing: -2,
    fontWeight: theme.typography.weights.bold,
  },
});
