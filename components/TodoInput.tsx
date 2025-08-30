import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

interface TodoInputProps {
  onAddTodo: (title: string) => void;
  placeholder?: string;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  onAddTodo,
  placeholder = "What needs to be done?",
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAddTodo(trimmedValue);
      setInputValue('');
    }
  };

  const handleSubmitEditing = () => {
    handleSubmit();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          returnKeyType="done"
          blurOnSubmit={false}
          multiline={false}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            !inputValue.trim() && styles.addButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!inputValue.trim()}
        >
          <Text
            style={[
              styles.addButtonText,
              !inputValue.trim() && styles.addButtonTextDisabled,
            ]}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e1e1',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  addButton: {
    marginLeft: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#888888',
  },
});
