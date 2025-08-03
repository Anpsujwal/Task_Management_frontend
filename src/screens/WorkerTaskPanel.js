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
import { ScrollView } from 'react-native';

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
      {!filterByDate && <TouchableOpacity style={styles.filterButton} onPress={() => setFilterByDate(true)}>
                                <Text style={styles.filterButtonText}>Filter Tasks By Date</Text>
                              </TouchableOpacity>}

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
      <View style={styles.usersBox}>
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
      </View>
      <View style={styles.usersBox}>
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
  container: {
    padding: 20,
    backgroundColor: '#f9fafe',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1e3a8a', // deep blue
  },
    filterButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
    usersBox: {
  backgroundColor: '#f9fbfd',
  padding: 10,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOpacity: 0.03,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
  marginBottom: 30,
},
  taskItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', 
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e40af',
  },
  taskStatus: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
  },
  selectedTask: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginVertical: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
