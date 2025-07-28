import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Title, Switch, IconButton, Divider, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import GoBackToDashboard from '../Components/GoToDashboard';

const AdminPanel = () => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignToUser, setAssignToUser] = useState(true);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState(['Team A', 'Team B']);
  const [users, setUsers] = useState(['user1@example.com', 'user2@example.com']);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);

  const createTask = () => {
    if (!taskTitle || !selectedAssignee) return;
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      assignedTo: selectedAssignee,
      type: assignToUser ? 'user' : 'group',
      status: 'Pending',
    };
    setTasks([...tasks, newTask]);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedAssignee('');
  };

  const createGroup = () => {
    if (newGroupName && selectedGroupUsers.length > 0) {
      setGroups([...groups, newGroupName]);
      setNewGroupName('');
      setSelectedGroupUsers([]);
    }
  };

  const deleteUser = (user) => setUsers(users.filter(u => u !== user));
  const deleteGroup = (group) => setGroups(groups.filter(g => g !== group));

  return (
    <SafeAreaView style={styles.safeArea}>
      <GoBackToDashboard/>
      <ScrollView contentContainerStyle={styles.container}>

        <Title style={styles.heading}>🗂️ Admin Panel - Task Assignment</Title>

        <TextInput
          label="Task Title"
          mode="outlined"
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={styles.input}
        />
        <TextInput
          label="Description"
          mode="outlined"
          value={taskDescription}
          onChangeText={setTaskDescription}
          style={styles.input}
        />

        <View style={styles.toggleRow}>
          <Text>Assign to User</Text>
          <Switch value={assignToUser} onValueChange={setAssignToUser} />
        </View>

        <Text style={{ marginTop: 10, marginBottom: 6 }}>Assign To:</Text>
        <View style={styles.toggleGroup}>
          {(assignToUser ? users : groups).map((item) => (
            <Chip
              key={item}
              selected={selectedAssignee === item}
              onPress={() => setSelectedAssignee(item)}
              style={styles.chip}
            >
              {item}
            </Chip>
          ))}
        </View>


        <Button mode="contained" onPress={createTask} style={styles.button}>
          Create Task
        </Button>

        <Divider style={styles.divider} />

        <Title style={styles.heading}>👥 Create Group</Title>
        <TextInput
          label="Group Name"
          mode="outlined"
          value={newGroupName}
          onChangeText={setNewGroupName}
          style={styles.input}
        />

        <Text>Select Users for Group</Text>
        {users.map(user => (
          <View key={user} style={styles.toggleRow}>
            <Text>{user}</Text>
            <Switch
              value={selectedGroupUsers.includes(user)}
              onValueChange={() => {
                if (selectedGroupUsers.includes(user)) {
                  setSelectedGroupUsers(selectedGroupUsers.filter(u => u !== user));
                } else {
                  setSelectedGroupUsers([...selectedGroupUsers, user]);
                }
              }}
            />
          </View>
        ))}
        <Button mode="outlined" onPress={createGroup} style={styles.button}>
          Create Group
        </Button>

        <Divider style={styles.divider} />

        <Title style={styles.heading}>📋 All Tasks</Title>
        {tasks.map(task => (
          <Card key={task.id} style={styles.card}>
            <Card.Title title={task.title} subtitle={`Assigned to: ${task.assignedTo}`} />
            <Card.Content>
              <Text>Status: {task.status}</Text>
              <Text>Description: {task.description}</Text>
            </Card.Content>
          </Card>
        ))}

        <Divider style={styles.divider} />

        <Title style={styles.heading}>👤 Manage Users</Title>
        {users.map(user => (
          <Chip
            key={user}
            style={styles.chip}
            onClose={() => deleteUser(user)}
          >
            {user}
          </Chip>
        ))}

        <Divider style={styles.divider} />

        <Title style={styles.heading}>👨‍👩‍👧‍👦 Manage Groups</Title>
        {groups.map(group => (
          <Chip
            key={group}
            style={styles.chip}
            onClose={() => deleteGroup(group)}
          >
            {group}
          </Chip>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  input: { marginVertical: 8 },
  button: { marginVertical: 10 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 3,
  },
  chip: {
    margin: 4,
  },
  divider: {
    marginVertical: 20,
  },
});

export default AdminPanel;
