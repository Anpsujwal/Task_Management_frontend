import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import MultiSelect from 'react-native-multiple-select';

export default function GroupManagementScreen() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]); // selected userIds for new group
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // dropdown list
  const [allUsersMap, setAllUsersMap] = useState({}); // _id -> name
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [editModeGroupId, setEditModeGroupId] = useState(null);
  const [editedGroupName, setEditedGroupName] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
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
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Unable to fetch users');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName) {
      Alert.alert('Validation Error', 'Group name is required');
      return;
    }
    try {
      console.log('Creating group with:', { groupName, users });
      await api.post('/api/groups', { name: groupName, users });
      setGroupName('');
      setUsers([]);
      fetchGroups();
      Alert.alert('Success', 'Group created');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.msg || 'Failed to create group');
    }
  };

  const updateGroupUsers = async ( groupId) => {
    try {
      await api.put(`/api/groups/${groupId}/add-users`, {name: editedGroupName, users: updatedUsers });
      fetchGroups();
      Alert.alert('Success', 'Group updated');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.msg || 'Failed to update group');
    }
  };

  const onGroupClick = (groupUsers) => {
    setUpdatedUsers(groupUsers || []);
  };

  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, []);

  return (
    <LinearGradient colors={['#8e9eab', '#eef2f3']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
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
              selectText="Add Users to Group"
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                          <TouchableOpacity
                            style={[styles.button, { flex: 1, backgroundColor: '#28a745' }]}
                            onPress={() => {
                              updateGroupUsers( item._id);
                              setEditModeGroupId(null);
                              setExpandedGroupId(null);
                            }}
                          >
                            <Text style={styles.buttonText}>Save Changes</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.button, { flex: 1, backgroundColor: '#ccc' }]}
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
                        <TouchableOpacity
                          style={[styles.button, { marginTop: 10 }]}
                          onPress={() => {
                            setEditModeGroupId(item._id);
                            setEditedGroupName(item.name);
                            setUpdatedUsers(item.users || []);
                          }}
                        >
                          <Text style={styles.buttonText}>Update Group</Text>
                        </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    marginBottom: 15,
  },
  multiSelectWrapper: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0077cc',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  groupItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  groupText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0077cc',
  },
  userLabel: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  userText: {
    fontSize: 14,
    color: '#555',
    paddingLeft: 8,
    paddingVertical: 2,
  },
});
