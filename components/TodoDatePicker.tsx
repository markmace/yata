import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { generateDaySequence, formatDayHeader, isSameDay } from '../utils/dateUtils';

interface TodoDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentDate: Date;
}

export const TodoDatePicker: React.FC<TodoDatePickerProps> = ({
  visible,
  onClose,
  onSelectDate,
  currentDate,
}) => {
  // Generate 14 days starting from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = generateDaySequence(today, 14);
  
  const handleSelectDate = (date: Date) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectDate(date);
    onClose();
  };

  const renderDateItem = ({ item: date }: { item: Date }) => {
    const isSelected = isSameDay(date, currentDate);
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          isSelected && styles.selectedDateItem
        ]}
        onPress={() => handleSelectDate(date)}
      >
        <Text style={[
          styles.dateText,
          isSelected && styles.selectedDateText
        ]}>
          {formatDayHeader(date)}
        </Text>
        {isSelected && (
          <MaterialIcons 
            name="check" 
            size={18} 
            color={theme.colors.text.inverse} 
          />
        )}
      </TouchableOpacity>
    );
  };

  const ContainerComponent = Platform.OS === 'web' ? View : BlurView;
  const containerProps = Platform.OS === 'web' ? {} : { intensity: 80, tint: 'dark' };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ContainerComponent {...containerProps} style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Move to...</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={days}
            renderItem={renderDateItem}
            keyExtractor={(date) => date.toISOString()}
            contentContainerStyle={styles.listContent}
          />
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ContainerComponent>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.elevated,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.default,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  listContent: {
    paddingVertical: theme.spacing.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.light,
  },
  selectedDateItem: {
    backgroundColor: theme.colors.actions.move,
  },
  dateText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
  },
  selectedDateText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weights.semibold,
  },
  cancelButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.default,
  },
  cancelText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
});
