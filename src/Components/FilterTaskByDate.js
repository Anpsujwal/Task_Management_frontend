import React, { useState } from 'react';
import { View, StyleSheet, Platform, Button, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function FilterByDate({ tasks, setFilteredTasks, setFilterByDate }) {
  const [filterOption, setFilterOption] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [specificDate, setSpecificDate] = useState(new Date());

  const handleFilterChange = () => {
    const taskDateFilter = (compareFunc) =>
      setFilteredTasks(tasks.filter(task => compareFunc(new Date(task.dueDate))));

    switch (filterOption) {
      case 'today':
        const today = new Date();
        taskDateFilter(date => date.toDateString() === today.toDateString());
        break;
      case 'tomorrow':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskDateFilter(date => date.toDateString() === tomorrow.toDateString());
        break;
      case 'thisWeek':
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        taskDateFilter(date => date >= startOfWeek && date <= endOfWeek);
        break;
      case 'thisMonth':
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        taskDateFilter(date => date >= startOfMonth && date <= endOfMonth);
        break;
      case 'thisYear':
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31);
        taskDateFilter(date => date >= startOfYear && date <= endOfYear);
        break;
      case 'specificDay':
        taskDateFilter(date => date.toDateString() === specificDate.toDateString());
        break;
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || specificDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSpecificDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Tasks By Date</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filterOption}
          onValueChange={setFilterOption}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item label="Today" value="today" />
          <Picker.Item label="Tomorrow" value="tomorrow" />
          <Picker.Item label="This Week" value="thisWeek" />
          <Picker.Item label="This Month" value="thisMonth" />
          <Picker.Item label="This Year" value="thisYear" />
          <Picker.Item label="Specific Day" value="specificDay" />
        </Picker>
      </View>

      {filterOption === 'specificDay' && (
        <View style={styles.datePickerContainer}>
          {Platform.OS === 'android' && !showDatePicker && (
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>Pick a Date</Text>
            </TouchableOpacity>
          )}
          {showDatePicker && (
            <DateTimePicker
              value={specificDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.applyButton} onPress={handleFilterChange}>
          <Text style={styles.buttonText}>Apply Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setFilterByDate(false);
            setFilteredTasks([]);
          }}
        >
          <Text style={styles.buttonText}>Clear Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  datePickerContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  dateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    marginRight: 5,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
