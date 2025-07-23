import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, ScrollView, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSelect from 'react-native-multiple-select';
import TaskEditComponent from '../Components/TaskEditComponent';


export default function TaskManagementScreen() {
  const { user } = useContext(AuthContext);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState('low');
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [assignedGroup, setAssignedGroup] = useState('');
  const [scheduleFor, setScheduleFor] = useState('specific_day');
  const [groups, setGroups] = useState([]);

  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  
  


  const handleCreateTask = async () => {
    try {
      const payload = {
        title: newTaskTitle,
        comment,
        priority,
        assignedWorkers,
        scheduleFor,
        dueDate,

      };

      if (assignedGroup) {
        payload.assignedGroup = assignedGroup; // only add if it's not empty
      }
      const res = await api.post('/api/tasks', payload);
      fetchAllTasks();
      Alert.alert('Success', 'Task created');
      setNewTaskTitle('');
      setComment('');
      setPriority('low');
      setAssignedWorkers([]);
      setScheduleFor('specific_day');
      setAssignedGroup('');
      setDueDate(new Date());
 


    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to create task');
    }
  };


  const fetchAllTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      setAllTasks(res.data);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch all tasks');
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load groups');
    }
  }


  useEffect(() => {
    fetchAllTasks();
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Failed to load users for assignment');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      setDueDate(currentDate);
      setShowTimePicker(true); // Open time picker next
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(dueDate);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDueDate(updatedDate);
    }
  };



 



  return (
    <LinearGradient colors={['#fdfbfb', '#ebedee']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Task Management</Text>

        
          <View style={styles.updateSection}>
            <Text style={styles.heading}>Create New Task</Text>

            <TextInput
              placeholder="Task Title"
              style={styles.input}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TextInput
              placeholder="Comment"
              style={styles.input}
              multiline
              numberOfLines={2}
              value={comment}
              onChangeText={setComment}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={priority}
                onValueChange={setPriority}
                style={styles.picker}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="High" value="high" />
              </Picker>
            </View>


            <MultiSelect
              items={users}
              uniqueKey="_id"
              onSelectedItemsChange={setAssignedWorkers}
              selectedItems={assignedWorkers}
              selectText="Assign to Workers"
              searchInputPlaceholderText="Search Users..."
              tagRemoveIconColor="#ccc"
              tagBorderColor="#ccc"
              tagTextColor="#333"
              selectedItemTextColor="#0077cc"
              selectedItemIconColor="#0077cc"
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{ color: '#333' }}
              submitButtonColor="#0077cc"
              submitButtonText="Done"
              styleMainWrapper={styles.multiSelectWrapper}
            />

            <Text style={styles.label}>Assign to Group</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={assignedGroup}
                onValueChange={setAssignedGroup}
                style={styles.picker}
              >
                <Picker.Item label="Select group" value="" />
                {groups.map(g => (
                  <Picker.Item key={g._id} label={g.name} value={g._id} />
                ))}
              </Picker>
            </View>

            <Text>Schedule For:</Text>
            <Picker
              selectedValue={scheduleFor}
              style={styles.input}
              onValueChange={(itemValue) => setScheduleFor(itemValue)}>
              <Picker.Item label="Specific Day" value="specific_day" />
              <Picker.Item label="Weekdays" value="week_days" />
              <Picker.Item label="Weekends" value="week_ends" />
              <Picker.Item label="Alternate Days" value="alternate_days" />
              <Picker.Item label="Month" value="month" />
              <Picker.Item label="Quarter" value="quarter" />
              <Picker.Item label="Half Yearly" value="half_yearly" />
              <Picker.Item label="Yearly" value="yearly" />
            </Picker>

            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateText}>
              <Text>{dueDate.toLocaleString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={dueDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}


            <TouchableOpacity style={styles.submitButton} onPress={handleCreateTask}>
              <Text style={styles.submitText}>Create Task</Text>
            </TouchableOpacity>
          </View>

        

        { allTasks.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.heading}>Created Tasks</Text>
            {allTasks.map((task) => (
              <View key={task._id}>
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() => { setSelectedTaskDetails(task) }}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskStatus}>Priority: {task.priority}</Text>
                <Text style={styles.taskStatus}>scheduleFor: {task.scheduleFor}</Text>
                <Text style={styles.taskStatus}>
                  Group:{groups.find(group => group._id === task.assignedGroup)?.name || 'None'}
                </Text>
                <Text style={styles.taskStatus}>
                  Assigned Workers: {task.assignedWorkers?.length || 0}
                </Text>
                <Text style={styles.taskStatus}>Status: {task.status?.text}</Text>
              </TouchableOpacity>
              {selectedTaskDetails && selectedTaskDetails._id===task._id && <TaskEditComponent selectedTaskDetails={selectedTaskDetails} setSelectedTaskDetails={setSelectedTaskDetails} users={users} groups={groups}/>}
              </View>
            ))}
            
          </View>
        )}

        
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  taskStatus: {
    color: '#666',
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#0077cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateText: {
    color: '#fff',
    fontWeight: '600',
  },
  updateSection: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  multiSelectWrapper: {
    marginBottom: 20,
  },

  // Additional styles for enhanced form UX
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  multiSelectOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#cce5ff',
  },
  dateText: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
});

