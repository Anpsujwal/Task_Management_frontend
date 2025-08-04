import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import MultiSelect from 'react-native-multiple-select';
import GoBackToDashboard from '../Components/GoToDashboard';
import { LogBox } from 'react-native';

export default function GroupManagementScreen() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersMap, setAllUsersMap] = useState({});
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [editModeGroupId, setEditModeGroupId] = useState(null);
  const [editedGroupName, setEditedGroupName] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch groups');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/api/users');
      const mapped = res.data.map(user => ({
        id: user._id,
        name: `${user.name} (ID: ${user.userId})`
      }));
      const map = {};
      res.data.forEach(user => { map[user._id] = user.name; });

      setAllUsers(mapped);
      setAllUsersMap(map);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch users');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName) {
      Alert.alert('Validation Error', 'Group name is required');
      return;
    }
    try {
      await api.post('/api/groups', { name: groupName, users });
      setGroupName('');
      setUsers([]);
      fetchGroups();
      Alert.alert('Success', 'Group created');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to create group');
    }
  };

  const updateGroupUsers = async (groupId) => {
    try {
      await api.put(`/api/groups/${groupId}/add-users`, {
        name: editedGroupName,
        users: updatedUsers
      });
      fetchGroups();
      Alert.alert('Success', 'Group updated');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to update group');
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await api.delete(`/api/groups/${groupId}`);
      fetchGroups();
      Alert.alert('Success', 'Group deleted');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to delete group');
    }
  };

  const onGroupClick = (groupUsers) => {
    setUpdatedUsers(groupUsers || []);
  };

  useEffect(() => {
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested', // Ignore this warning
  ]);
}, []);

  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, []);

  return (
    <LinearGradient colors={['#e9fefeff', '#f9f9f9ff']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <GoBackToDashboard />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.heading}>Group Management</Text>

            <TextInput
              placeholder="Enter group name"
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
            />

            <MultiSelect
              items={allUsers}
              uniqueKey="id"
              onSelectedItemsChange={setUsers}
              selectedItems={users}
              selectText="➕ Add Users to Group"
              searchInputPlaceholderText="Search Users..."
              tagTextColor="#0077cc"
              tagRemoveIconColor="#0077cc"
              tagBorderColor="#0077cc"
              selectedItemTextColor="#fff"
              selectedItemIconColor="#fff"
              submitButtonColor="#0077cc"
              itemTextColor="#333"
              displayKey="name"
              searchInputStyle={{ color: '#333', fontSize: 16 }}
              submitButtonText="Done"
              styleDropdownMenuSubsection={styles.dropdownSubsection}
              styleMainWrapper={styles.multiSelectWrapper}
              styleInputGroup={styles.inputGroup}
              styleSelectorContainer={styles.selectorContainer}
              styleItemsContainer={styles.itemsContainer}
            />


            <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
              <Text style={styles.buttonText}>Create Group</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={groups}
            keyExtractor={item => item._id}
            renderItem={({ item }) => {
              const isExpanded = expandedGroupId === item._id;
              const isEditing = editModeGroupId === item._id;

              return (
                <View style={styles.groupItem}>
                  <TouchableOpacity
                    onPress={() => {
                      onGroupClick(item.users);
                      setExpandedGroupId(isExpanded ? null : item._id);
                      if (isEditing) setEditModeGroupId(null);
                    }}
                  >
                    <Text style={styles.groupText}>{item.name}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <>
                      <Text style={styles.userLabel}>Group Name:</Text>
                      {isEditing ? (
                        <TextInput
                          style={[styles.input, { marginTop: 5 }]}
                          value={editedGroupName}
                          onChangeText={setEditedGroupName}
                        />
                      ) : (
                        <Text style={styles.userText}>{item.name}</Text>
                      )}

                      <Text style={styles.userLabel}>Users:</Text>
                      {!isEditing ? (
                        item.users?.length ? (
                          item.users.map(uid => (
                            <Text key={uid} style={styles.userText}>
                              {allUsersMap[uid] || `User ID: ${uid}`}
                            </Text>
                          ))
                        ) : (
                          <Text style={{ fontStyle: 'italic' }}>No users in this group</Text>
                        )
                      ) : (
                        <MultiSelect
                          items={allUsers}
                          uniqueKey="id"
                          onSelectedItemsChange={setUpdatedUsers}
                          selectedItems={updatedUsers}
                          selectText="Update Users"
                          searchInputPlaceholderText="Search Users..."
                          tagRemoveIconColor="#ccc"
                          tagBorderColor="#ccc"
                          tagTextColor="#333"
                          styleTag={{
                            backgroundColor: '#0077cc',
                            borderRadius: 16,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                          }}

                          styleTagText={{
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 14,
                          }}

                          selectedItemTextColor="#0077cc"
                          selectedItemIconColor="#0077cc"
                          itemTextColor="#000"
                          displayKey="name"
                          searchInputStyle={{ color: '#333' }}
                          submitButtonColor="#28a745"
                          submitButtonText="Done"
                          styleMainWrapper={styles.multiSelectWrapper}
                        />
                      )}

                      {isEditing ? (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#28a745' }]}
                            onPress={() => {
                              updateGroupUsers(item._id);
                              setEditModeGroupId(null);
                              setExpandedGroupId(null);
                            }}
                          >
                            <Text style={styles.buttonText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#ccc' }]}
                            onPress={() => {
                              setEditModeGroupId(null);
                              setEditedGroupName('');
                              setUpdatedUsers([]);
                            }}
                          >
                            <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                              setEditModeGroupId(item._id);
                              setEditedGroupName(item.name);
                              setUpdatedUsers(item.users || []);
                            }}
                          >
                            <Text style={styles.buttonText}>Update</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#e74c3c' }]}
                            onPress={() => deleteGroup(item._id)}
                          >
                            <Text style={styles.buttonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            }}
            scrollEnabled={false}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077cc',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    marginBottom: 15,
  },
  multiSelectWrapper: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0077cc',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  multiSelectWrapper: {
  marginVertical: 15,
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: '#0077cc',
  padding: 10,
  backgroundColor: '#f0f8ff',
  elevation: 3,
},

  dropdownSubsection: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#0077cc',
    backgroundColor: '#e6f0fa',
    borderRadius: 8,
  },

  inputGroup: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  selectorContainer: {
    marginBottom: 8,
  },

  itemsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    maxHeight: 250,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  groupItem: {
    backgroundColor: '#fdfdfd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  groupText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userLabel: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#444',
  },
  userText: {
    fontSize: 14,
    color: '#555',
    paddingVertical: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
});
