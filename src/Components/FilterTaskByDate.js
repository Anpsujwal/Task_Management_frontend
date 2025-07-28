import React, { useState } from 'react';
import { View, StyleSheet, Platform, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function FilterByDate({tasks, setFilteredTasks,setFilterByDate }) {
  const [filterOption, setFilterOption] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [specificDate, setSpecificDate] = useState(new Date());


  const handleFilterChange = () => {

    if(filterOption === 'today') {
        const today = new Date();
        setFilteredTasks(tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === today.toDateString();
        }));
    }else if(filterOption === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFilteredTasks(tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === tomorrow.toDateString();
        }));
    } else if(filterOption === 'thisWeek') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        setFilteredTasks(tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= startOfWeek && taskDate <= endOfWeek;
        }));
    } else if(filterOption === 'thisMonth') {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        setFilteredTasks(tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= startOfMonth && taskDate <= endOfMonth;
        }));
    } else if(filterOption === 'thisYear') {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31);
        setFilteredTasks(tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= startOfYear && taskDate <= endOfYear;
        }));
    } else if(filterOption === 'specificDay') {
        setFilteredTasks(tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === specificDate.toDateString();
        }));
    }

  };


  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || specificDate;
    setShowDatePicker(Platform.OS === 'ios'); 
    setSpecificDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={filterOption}
        onValueChange={setFilterOption}
        style={styles.picker}
      >
        <Picker.Item label="Today" value="today" />
        <Picker.Item label="Tomorrow" value="tomorrow" />
        <Picker.Item label="This Week" value="thisWeek" />
        <Picker.Item label="This Month" value="thisMonth" />
        <Picker.Item label="This Year" value="thisYear" />
        <Picker.Item label="Specific Day" value="specificDay" />
      </Picker>

     
      {filterOption === 'specificDay' && (
        <View>
          {Platform.OS === 'android' && !showDatePicker && (
            <Button title="Pick a Date" onPress={() => setShowDatePicker(true)} />
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
        <Button title="Apply Filter" onPress={() => handleFilterChange()} />
        <Button title="Close Filter" onPress={() => {setFilterByDate(false);setFilteredTasks([])}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
