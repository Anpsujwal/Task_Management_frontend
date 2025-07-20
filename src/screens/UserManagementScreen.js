import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Alert, TouchableOpacity, ScrollView, Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [assignedGroup, setAssignedGroup] = useState('');
  const [groups, setGroups] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert("Error", "Unable to fetch users");
    }
  };

  const handleCreateUser = async () => {
    if (!name || !password) {
      Alert.alert("Validation Error", "All fields are required");
      return;
    }
    try {
      payload={
        name,
        userId,
        password,
        isAdmin,
      }
      if (assignedGroup) {
        payload.group = assignedGroup;
      }
      await api.post('/api/auth/signup', payload);

      setName('');
      setUserId('');
      setPassword('');
      setIsAdmin(false);
      fetchUsers();
      setAssignedGroup('');

      Alert.alert("Success", "User created");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers();
      Alert.alert("Deleted", "User has been deleted");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setEditName(user.name);
    setEditIsAdmin(user.isAdmin);
  };

  const handleUpdateUser = async () => {
    try {
      await api.put(`/api/users/${editingUserId}`, {
        name: editName,
        isAdmin: editIsAdmin,
      });
      setEditingUserId(null);
      fetchUsers();
      Alert.alert("Success", "User updated");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update user");
    }
  };
  const fetchGroups = async () => {
    try{
       const res=await api.get('/api/groups');
       setGroups(res.data);
    }catch(err){
      Alert.alert('Error', 'Failed to load groups');
    }
  }



  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  return (
    <LinearGradient colors={['#ece9e6', '#ffffff']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>User Management</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="userId"
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.toggleContainer}>
            <Text style={[styles.label, !isAdmin && styles.selected]}>User</Text>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              thumbColor={isAdmin ? '#1e90ff' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
            <Text style={[styles.label, isAdmin && styles.selected]}>Admin</Text>
          </View>

          <Text style={styles.label}>Assign to Group</Text>
          <View style={styles.input}>
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

          <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
            <Text style={styles.buttonText}>Create User</Text>
          </TouchableOpacity>
        </View>

        {users.length > 0 ? (
          <View>
            <Text style={styles.heading}>Existing Users</Text>
            <FlatList
              data={users}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <Text style={styles.userName}>ID: {item.userId}</Text>
                  <Text style={styles.userEmail}>Name: {item.name}</Text>
                  <Text style={styles.userRole}>Role: {item.isAdmin ? 'Admin' : 'User'}</Text>
                  <Text>Group:{groups.filter((group)=>group._id===item.group)[0]?.name}</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={() => handleEditUser(item)}
                    >
                      <Text style={styles.smallButtonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallButton, { backgroundColor: '#dc3545' }]}
                      onPress={() => handleDeleteUser(item._id)}
                    >
                      <Text style={styles.smallButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {editingUserId === item._id && (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Edit name"
                        style={styles.input}
                      />
                      <View style={styles.toggleContainer}>
                        <Text style={[styles.label, !editIsAdmin && styles.selected]}>User</Text>
                        <Switch
                          value={editIsAdmin}
                          onValueChange={setEditIsAdmin}
                          thumbColor={editIsAdmin ? '#1e90ff' : '#f4f3f4'}
                          trackColor={{ false: '#767577', true: '#81b0ff' }}
                        />
                        <Text style={[styles.label, editIsAdmin && styles.selected]}>Admin</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.button, { marginTop: 10 }]}
                        onPress={handleUpdateUser}
                      >
                        <Text style={styles.buttonText}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              scrollEnabled={false}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <Text style={styles.noUsersText}>No users created</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20 },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#999',
    marginHorizontal: 10,
  },
  selected: {
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
  },
  userRole: {
    fontSize: 13,
    marginTop: 5,
    color: '#888',
    fontStyle: 'italic',
  },
  noUsersText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  smallButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editContainer: {
    marginTop: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
  },
});
