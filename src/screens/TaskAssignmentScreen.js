import { useEffect, useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Button, FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';


import TaskEditComponent from '../Components/TaskEditComponent';
import GoBackToDashboard from '../Components/GoToDashboard';
import TaskCreationForm from '../Components/TaskCreationForm';
import FilterByDate from '../Components/FilterTaskByDate';

import { AuthContext } from '../context/AuthContext';

export default function TaskManagementScreen() {

  const { user } = useContext(AuthContext);

  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [group, setGroup] = useState([]);

  const [createNewTask, setCreateNewTask] = useState(false);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);


  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  const fetchAllTasks = async () => {
    try {
      const res = await api.get(`/api/tasks/createdby/${user._id}`);
      setAllTasks(res.data);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch all tasks');
    }
  }

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/api/groups/${user.group}`);
      setGroup(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load groups');
    }
  }


  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Failed to load users for assignment');
    }
  };

  useEffect(() => {
    fetchAllTasks();
    fetchUsers();
    fetchGroup();
    setSelectedTaskDetails(null);
  }, []);



  return (
    <LinearGradient colors={['#fdfbfb', '#ebedee']} style={styles.gradient}>
      <GoBackToDashboard />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Task Management</Text>

        {!createNewTask && <Button title="Create Task" onPress={() => { setCreateNewTask(true); setFilterByDate(false) }}></Button>}
        {!filterByDate && <Button title="Filter Tasks By Date" onPress={() => { setFilterByDate(true); setCreateNewTask(false) }}></Button>}

        {createNewTask && <TaskCreationForm users={users} group={group} fetchAllTasks={fetchAllTasks} setCreateNewTask={setCreateNewTask}></TaskCreationForm>}
        {filterByDate && <FilterByDate tasks={allTasks} setFilteredTasks={setFilteredTasks} setFilterByDate={setFilterByDate} />}

        {filteredTasks.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.heading}>Filtered Tasks</Text>
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item._id}
              renderItem={({ item: task }) => (
                <View>
                  <TouchableOpacity
                    style={styles.taskItem}
                    onPress={() => setSelectedTaskDetails(task)}
                  >
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskStatus}>Priority: {task.priority}</Text>
                    <Text style={styles.taskStatus}>ScheduleFor: {task.scheduleFor}</Text>
                    <Text style={styles.taskStatus}>
                      Assigned Workers: {task.assignedWorkers?.length || 0}
                    </Text>
                    <Text style={styles.taskStatus}>Status: {task.status?.text}</Text>
                  </TouchableOpacity>

                  {selectedTaskDetails && selectedTaskDetails._id === task._id && (
                    <TaskEditComponent
                      selectedTaskDetails={selectedTaskDetails}
                      setSelectedTaskDetails={setSelectedTaskDetails}
                      users={users}
                      groups={group}
                      fetchTasks={fetchAllTasks}
                    />
                  )}
                </View>
              )}
            />

          </View>
        )}



        {allTasks.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.heading}>Created Tasks</Text>
            <FlatList
              data={allTasks}
              keyExtractor={(item) => item._id}
              renderItem={({ item: task }) => (
                <View>
                  <TouchableOpacity
                    style={styles.taskItem}
                    onPress={() => setSelectedTaskDetails(task)}
                  >
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskStatus}>Priority: {task.priority}</Text>
                    <Text style={styles.taskStatus}>ScheduleFor: {task.scheduleFor}</Text>
                    <Text style={styles.taskStatus}>
                      Group: {group?.name || 'None'}
                    </Text>
                    <Text style={styles.taskStatus}>
                      Workers: {task.assignToEntireGroup
                        ? 'Assigned to entire group'
                        : task.assignedWorkers?.length || 0}
                    </Text>
                    <Text style={styles.taskStatus}>Status: {task.status?.text}</Text>
                  </TouchableOpacity>

                  {selectedTaskDetails && selectedTaskDetails._id === task._id && (
                    <TaskEditComponent
                      selectedTaskDetails={selectedTaskDetails}
                      setSelectedTaskDetails={setSelectedTaskDetails}
                      users={users}
                      fetchTasks={fetchAllTasks}
                    />
                  )}
                </View>
              )}
            />

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

