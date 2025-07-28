import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Modal, TouchableOpacity, Button
} from 'react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import StatusUpdateForm from '../Components/StatusUpdateComponent';
import GoBackToDashboard from '../Components/GoToDashboard';
import FilterByDate from '../Components/FilterTaskByDate';
import { ScrollView } from 'react-native-web';

export default function TaskDashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [group, setGroup] = useState([]);

  const [filterByDate, setFilterByDate] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [groupTasks, setGroupTasks] = useState([]);

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

  const fetchGroupTasks = async () => {
    try {
      const res = await api.get(`/api/tasks/group/${user.group}`);
      setGroupTasks(res.data);
    } catch (err) {
      console.error('Error fetching group tasks:', err);
    }
  }

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/api/groups/${user.group}`);
      setGroup(res.data);
    } catch (err) {
      console.error('Error fetching group:', err);
    }
  }

  useEffect(() => {
    fetchUserTasks();
    fetchGroupTasks();
    fetchGroup();
  }, []);

  const handleStatusUpdate = async () => {
    setSelectedTask(null);
    fetchUserTasks(); // refresh
  };

  const freezeTask = async (taskId) => {
    try {
      const res = await api.patch(`/api/tasks/freeze/${taskId}`, { userId: user._id });
      if (res.status === 200) {
        alert('Task frozen successfully');
        fetchGroupTasks();
      }
    } catch (err) {
      console.error('Error freezing task:', err);
      alert('Failed to freeze task');
    }
  }
  const unfreezeTask = async (taskId) => {
    try {
      const res = await api.patch(`/api/tasks/unfreeze/${taskId}`, { userId: user._id });
      if (res.status === 200) {
        alert('Task unFrozen successfully');
        fetchGroupTasks();
      }
    } catch (err) {
      console.error('Error unFreezing task:', err);
      alert('Failed to unFreeze task');
    }
  }

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  return (
    <ScrollView style={styles.container}>
      <GoBackToDashboard />
      {!filterByDate && <Button title="Filter Tasks By Date" onPress={() => { setFilterByDate(true) }}></Button>}

      {filterByDate && <FilterByDate tasks={tasks} setFilteredTasks={setFilteredTasks} setFilterByDate={setFilterByDate} />}

      {filteredTasks.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.heading}>Filtered Tasks</Text>
          {filteredTasks.map((task) => (
            <View key={task._id}>
              <TouchableOpacity
                style={styles.taskItem}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskStatus}>Priority: {task.priority}</Text>
                <Text style={styles.taskStatus}>scheduleFor: {task.scheduleFor}</Text>
                <Text style={styles.taskStatus}>CreatedOn: {task.createdDate}</Text>
                <Text style={styles.taskStatus}>Due Date: {task.dueDate || 'Not set'}</Text>
                <Text style={styles.taskStatus}>Status: {task.status?.text}</Text>
              </TouchableOpacity>

            </View>
          ))}

        </View>
      )}

      <View style={{ marginTop: 30 }}>
        <Text style={styles.heading}>Your Tasks</Text>
        {tasks.map((task) => (
          <View key={task._id}>
            <TouchableOpacity
              style={styles.taskItem}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskStatus}>Priority: {task.priority}</Text>
              <Text style={styles.taskStatus}>scheduleFor: {task.scheduleFor}</Text>
              <Text style={styles.taskStatus}>CreatedOn: {task.createdDate}</Text>
              <Text style={styles.taskStatus}>Due Date: {task.dueDate || 'Not set'}</Text>
              <Text style={styles.taskStatus}>Status: {task.status?.text}</Text>
              <Button title="Update Status" onPress={() => { setSelectedTask(task) }}></Button>
            </TouchableOpacity>


          </View>
        ))}




      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={styles.heading}>Group Tasks</Text>
        {groupTasks.map((task) => (
          <View key={task._id}>
            <TouchableOpacity
              style={styles.taskItem}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskStatus}>Priority: {task.priority}</Text>
              <Text style={styles.taskStatus}>scheduleFor: {task.scheduleFor}</Text>
              <Text style={styles.taskStatus}>CreatedOn: {task.createdDate}</Text>
              <Text style={styles.taskStatus}>Due Date: {task.dueDate || 'Not set'}</Text>
              <Text style={styles.taskStatus}>Status: {task.status?.text}</Text>
              {task.assignToEntireGroup &&
                <View>
                  <Text style={styles.taskStatus}>
                    Assigned to Group: {group?.name || 'None'}
                  </Text>
                  <Text style={styles.taskStatus}>
                    Workers Needed: {task.groupTaskDetails?.workersNeeded}
                  </Text>
                  <Text style={styles.selectedTask}>
                    Assigned Workers: {task.groupTaskDetails?.frozenBy?.length || 0}
                  </Text>
                  {(task.groupTaskDetails?.frozenBy?.find((id) => id === user?._id)) ?
                    <View>
                      <Text style={styles.selectedTask}>You Frooze the Task</Text>
                      <Button title='UnFreeze Task' onPress={()=>{unfreezeTask(task._id)}}></Button>
                      <Button title="Update Status" onPress={() => { setSelectedTask(task) }}></Button>
                    </View>
                     :
                    (task.groupTaskDetails?.frozenBy?.length < task.groupTaskDetails?.workersNeeded) &&

                    <Button title='Freeze Task' onPress={() => { freezeTask(task._id) }}></Button>
                  }
                </View>
              }
              {/* <Button title="Update Status" onPress={() => { setSelectedTask(task) }}></Button> */}
            </TouchableOpacity>


          </View>
        ))}
      </View>



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
    </ScrollView>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
});
