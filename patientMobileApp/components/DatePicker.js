import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDatePicker = ({ 
  value, 
  onDateChange, 
  placeholder = "Select Date", 
  label,
  minimumDate = new Date(),
  maximumDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  mode = 'date'
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    } else if (Platform.OS === 'ios' && event.type === 'set') {
      setShowPicker(false);
    }
    if (selectedDate) {
      if (mode === 'date') {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        onDateChange(`${year}-${month}-${day}`);
      } else if (mode === 'time') {
        const hours = String(selectedDate.getHours()).padStart(2, '0');
        const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
        onDateChange(`${hours}:${minutes}`);
      }
    }
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    
    if (mode === 'date') {
      const [year, month, day] = value.split('-');
      return `${month}/${day}/${year}`;
    } else if (mode === 'time') {
      return value;
    }
    
    return value;
  };

  const getIconName = () => {
    return mode === 'date' ? 'calendar-outline' : 'time-outline';
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={styles.pickerButton} 
        onPress={() => setShowPicker(true)}
      >
        <View style={styles.pickerContent}>
          <Ionicons name={getIconName()} size={20} color="#666" />
          <Text style={[styles.pickerText, !value && styles.placeholderText]}>
            {formatDisplayValue()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          style={styles.dateTimePicker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  placeholderText: {
    color: '#999',
  },
  dateTimePicker: {
    width: Platform.OS === 'ios' ? '100%' : 0,
    height: Platform.OS === 'ios' ? 200 : 0,
  },
});

export default CustomDatePicker; 