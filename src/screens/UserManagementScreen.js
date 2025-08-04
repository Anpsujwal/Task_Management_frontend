import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Alert, TouchableOpacity, ScrollView, Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import GoBackToDashboard from '../Components/GoToDashboard';
import { AuthContext } from '../context/AuthContext';
import { LogBox } from 'react-native';

export default function UserManagementScreen() {

  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminType, setAdminType] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editAdminType, setEditAdminType] = useState(false);
  const [assignedGroup, setAssignedGroup] = useState('');
  const [groups, setGroups] = useState([]);


  const handleCreateUser = async () => {
    if (!name || !password) {
      Alert.alert("Validation Error", "All fields are required");
      return;
    }
    try {
      payload = {
        name,
        userId,
        password,
        isAdmin,
      }
      if (assignedGroup) {
        payload.group = assignedGroup;
      }
      if (isAdmin) {
        if (adminType) payload.adminType = "root";
        else payload.adminType = "group";
      }
      const res = await api.post('/api/auth/signup', payload);

      await api.patch(`/api/groups/${assignedGroup}/addUser`, { userId: res.data.id });

      console.log("group updated successfully");


      setName('');
      setUserId('');
      setPassword('');
      setIsAdmin(false);
      setAdminType(false);
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
    setEditAdminType(user.adminType === "root");
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

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');

      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert("Error", "Unable to fetch users");
    }
  };

  const fetchGroups = async () => {
    try {
      if (user.adminType === "group") {
        const res = await api.get(`/api/groups/${user.group}`);
        setGroups([res.data]);
        setAssignedGroup(user.group);
        return;
      }
      const res = await api.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load groups');
    }
  }

  useEffect(() => {
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested', // Ignore this warning
  ]);
}, []);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  

  useEffect(() => {
    if (user.adminType === "group") setFilteredUsers(users.filter(u => u.group === user.group));
    else setFilteredUsers( users);
  }, [users]);

 return (
    <LinearGradient colors={['#ece9e6', '#ffffff']} style={styles.gradient}>
      <GoBackToDashboard />
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
            placeholder="User ID"
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
              thumbColor={isAdmin ? '#007bff' : '#f4f3f4'}
              trackColor={{ false: '#ccc', true: '#a3d2ff' }}
            />
            <Text style={[styles.label, isAdmin && styles.selected]}>Admin</Text>
          </View>

          {isAdmin && (
            <View style={styles.toggleContainer}>
              <Text style={[styles.label, !adminType && styles.selected]}>Group Admin</Text>
              <Switch
                value={adminType}
                onValueChange={setAdminType}
                thumbColor={adminType ? '#007bff' : '#f4f3f4'}
                trackColor={{ false: '#ccc', true: '#a3d2ff' }}
              />
              <Text style={[styles.label, adminType && styles.selected]}>Root Admin</Text>
            </View>
          )}

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

          <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
            <Text style={styles.buttonText}>Create User</Text>
          </TouchableOpacity>
        </View>

        {filteredUsers?.length > 0 ? (
          <>
            <Text style={styles.heading}>Existing Users</Text>
            {filteredUsers.map(user => (
              <View key={user._id} style={styles.userItem}>
                <Text style={styles.userName}>ID: {user.userId}</Text>
                <Text style={styles.userEmail}>Name: {user.name}</Text>
                <Text style={styles.userRole}>Role: {user.isAdmin ? `${user.adminType} Admin` : 'Worker'}</Text>
                <Text>Group: {groups.find(g => g._id === user.group)?.name || "N/A"}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => handleEditUser(user)}
                  >
                    <Text style={styles.smallButtonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, { backgroundColor: '#dc3545' }]}
                    onPress={() => handleDeleteUser(user._id)}
                  >
                    <Text style={styles.smallButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {editingUserId === user._id && (
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
                        thumbColor={editIsAdmin ? '#007bff' : '#f4f3f4'}
                        trackColor={{ false: '#ccc', true: '#a3d2ff' }}
                      />
                      <Text style={[styles.label, editIsAdmin && styles.selected]}>Admin</Text>
                    </View>
                    {editIsAdmin && (
                      <View style={styles.toggleContainer}>
                        <Text style={[styles.label, !editAdminType && styles.selected]}>Group Admin</Text>
                        <Switch
                          value={editAdminType}
                          onValueChange={setEditAdminType}
                          thumbColor={editAdminType ? '#007bff' : '#f4f3f4'}
                          trackColor={{ false: '#ccc', true: '#a3d2ff' }}
                        />
                        <Text style={[styles.label, editAdminType && styles.selected]}>Root Admin</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10 }]}
                      onPress={handleUpdateUser}
                    >
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
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
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  marginBottom: 30,
},
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 50 },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#222',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 59,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#777',
    marginHorizontal: 10,
  },
  selected: {
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 12,
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
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  userEmail: {
    fontSize: 14,
    color: '#444',
  },
  userRole: {
    fontSize: 13,
    marginTop: 5,
    color: '#666',
    fontStyle: 'italic',
  },
  noUsersText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 30,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editContainer: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
  },



input: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 14,
  marginBottom: 16,
  backgroundColor: '#fafafa',
  fontSize: 15,
},

toggleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
},

label: {
  fontSize: 16,
  color: '#555',
  marginHorizontal: 10,
},

button: {
  backgroundColor: '#007bff',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
  elevation: 2,
},

buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 14,
  gap: 10,
},

smallButton: {
  flex: 1,
  backgroundColor: '#28a745',
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: 'center',
  elevation: 2,
},

editContainer: {
  marginTop: 14,
  backgroundColor: '#f5f7f8',
  padding: 16,
  borderRadius: 12,
  elevation: 2,
},

userItem: {
  backgroundColor: '#fff',
  padding: 18,
  borderRadius: 14,
  marginBottom: 16,
  elevation: 3,
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 6,
  },

  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },

  userEmail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },

  userRole: {
    fontSize: 13,
    marginTop: 4,
    color: '#777',
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

  usersBox: {
  backgroundColor: '#f9fbfd',
  padding: 18,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOpacity: 0.03,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 2,
  marginBottom: 30,
},

sectionTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 16,
  textAlign: 'center',
  color: '#333',
},


});
