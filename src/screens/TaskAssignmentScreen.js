import { useEffect, useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ScrollView, FlatList
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
    <LinearGradient colors={['#f9fcff', '#f1f5f9']} style={styles.gradient}>
      <GoBackToDashboard />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Task Management</Text>

        {!createNewTask && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => { setCreateNewTask(true); setFilterByDate(false); }}
          >
            <Text style={styles.primaryButtonText}>+ Create Task</Text>
          </TouchableOpacity>
        )}

        {!filterByDate && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => { setFilterByDate(true); setCreateNewTask(false); }}
          >
            <Text style={styles.secondaryButtonText}>📅 Filter Tasks by Date</Text>
          </TouchableOpacity>
        )}

        {createNewTask && (
          <TaskCreationForm
            users={users}
            group={group}
            fetchAllTasks={fetchAllTasks}
            setCreateNewTask={setCreateNewTask}
          />
        )}

        {filterByDate && (
          <FilterByDate
            tasks={allTasks}
            setFilteredTasks={setFilteredTasks}
            setFilterByDate={setFilterByDate}
          />
        )}

        {filteredTasks.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.subHeading}>Filtered Tasks</Text>
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
                    <Text style={styles.taskDetail}>Priority: {task.priority}</Text>
                    <Text style={styles.taskDetail}>Schedule For: {task.scheduleFor}</Text>
                    <Text style={styles.taskDetail}>
                      Assigned Workers: {task.assignedWorkers?.length || 0}
                    </Text>
                    <Text style={styles.taskDetail}>Status: {task.status?.text}</Text>
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
            <Text style={styles.subHeading}>Created Tasks</Text>
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
                    <Text style={styles.taskDetail}>Priority: {task.priority}</Text>
                    <Text style={styles.taskDetail}>Schedule For: {task.scheduleFor}</Text>
                    <Text style={styles.taskDetail}>
                      Group: {group?.name || 'None'}
                    </Text>
                    <Text style={styles.taskDetail}>
                      Workers: {task.assignToEntireGroup
                        ? 'Assigned to entire group'
                        : task.assignedWorkers?.length || 0}
                    </Text>
                    <Text style={styles.taskDetail}>Status: {task.status?.text}</Text>
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#2c3e50',
  },
  subHeading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#0077cc',
  },
  primaryButton: {
    backgroundColor: '#0077cc',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e2f0fb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#0077cc',
    fontSize: 16,
    fontWeight: '600',
  },
  taskItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  taskDetail: {
    color: '#555',
    marginBottom: 4,
  },
});
