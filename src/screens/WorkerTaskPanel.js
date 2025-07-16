import React, { useEffect, useState,useContext } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Modal, TouchableOpacity
} from 'react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import StatusUpdateForm from '../Components/StatusUpdateComponent'; 

export default function TaskDashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchUserTasks = async () => {
    try {
      const res = await api.get(`/api/tasks/user/${user._id}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching user tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const handleStatusUpdate = async () => {
    setSelectedTask(null);
    fetchUserTasks(); // refresh
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => setSelectedTask(item)}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDesc}>{item.description}</Text>
      <Text>Status: {item.status.text}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
      />
      {selectedTask && (
        <Modal visible animationType="slide">
          <StatusUpdateForm
            task={selectedTask}
            user={user}
            onClose={() => setSelectedTask(null)}
            onSuccess={handleStatusUpdate}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  taskCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f0f4f7',
    borderRadius: 8
  },
  taskTitle: { fontSize: 18, fontWeight: '600' },
  taskDesc: { fontSize: 14, color: '#555' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
