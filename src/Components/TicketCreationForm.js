import { Picker } from '@react-native-picker/picker';
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert,Switch
} from 'react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
export default function TicketCreationForm({group, fetchAllTickets,setGroup }) {

  const { user } = useContext(AuthContext);

  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState('low');

  const handleCreateTicket = async () => {

    try {
      const payload = {
        title: newTicketTitle,
        comment,
        priority,
        assignedGroup:group._id,
        createdDate: new Date(),
        createdBy: user._id,
      };

      await api.post('/api/tickets/', payload);

      setNewTicketTitle('');
      setComment('');
      setPriority('low');
      setGroup(null);
      fetchAllTickets();

    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to create ticket');
    }
  };


  return (
    <View style={styles.updateSection}>
      <Text style={styles.heading}>Create New Ticket on {group.name}</Text>

      <TextInput
        placeholder="Ticket Title"
        style={styles.input}
        value={newTicketTitle}
        onChangeText={setNewTicketTitle}
      />

      <TextInput
        placeholder="Comment"
        style={styles.input}
        multiline
        numberOfLines={2}
        value={comment}
        onChangeText={setComment}
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={priority}
          onValueChange={setPriority}
          style={styles.picker}
        >
          <Picker.Item label="Low" value="low" />
          <Picker.Item label="High" value="high" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreateTicket}>
        <Text style={styles.submitText}>Create Ticket</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={() => setGroup(null)}>
        <Text style={styles.submitText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  )
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