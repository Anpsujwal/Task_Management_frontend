import { Picker } from '@react-native-picker/picker';
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const predefinedIssues = {
  Electricity: ['Fan not working', 'MCB trip', 'New switch board'],
  Plumbing: ['Leaky tap', 'Clogged drain', 'Water heater issue'],
  Security: ["Gate not closing properly", "Security guard absent", "CCTV not working"],
  Gardening: ["Plants not watered", "Lawn not maintained", "Weeds growing excessively"],
  "Cooking Gas Management": ["Gas cylinder leakage", "Gas not delivered on time", "Low gas pressure"],
  Cleaning: ["Staircase not cleaned", "Garbage not collected", "Water stagnation in corridors"],
};

export default function TicketCreationForm({ group, fetchAllTickets, setGroup }) {
  const { user } = useContext(AuthContext);

  const [selectedIssue, setSelectedIssue] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState('low');
  const [loading, setLoading] = useState(false);

  const issues = [...(predefinedIssues[group.name] || []), 'Others'];

  const handleCreateTicket = async () => {
    const title = selectedIssue === 'Others' ? customTitle : selectedIssue;

    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please select or enter a ticket title.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        comment,
        priority,
        assignedGroup: group._id,
        createdDate: new Date(),
        createdBy: user._id,
      };

      await api.post('/api/tickets/', payload);

      // Reset form
      setSelectedIssue('');
      setCustomTitle('');
      setComment('');
      setPriority('low');
      setGroup(null);
      fetchAllTickets();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.updateSection}>
      <Text style={styles.heading}>Create New Ticket for {group.name}</Text>

      <Text style={styles.label}>Select an Issue</Text>
      <View style={styles.issuesContainer}>
        {issues.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.issueButton,
              selectedIssue === item && styles.selectedButton,
            ]}
            onPress={() => {
              setSelectedIssue(item);
              setCustomTitle('');
            }}
          >
            <Text
              style={[
                styles.issueButtonText,
                selectedIssue === item && styles.issueButtonTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedIssue === 'Others' && (
        <TextInput
          placeholder="Enter custom ticket title"
          style={styles.input}
          value={customTitle}
          onChangeText={setCustomTitle}
        />
      )}

      <Text style={styles.label}>Comment</Text>
      <TextInput
        placeholder="Add more details"
        style={[styles.input, styles.commentBox]}
        multiline
        numberOfLines={4}
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

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCreateTicket}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Creating...' : 'Create Ticket'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: '#dc3545' }]}
        onPress={() => setGroup(null)}
      >
        <Text style={styles.submitText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    marginBottom: 15,
  },
  commentBox: {
    height: 100,
    textAlignVertical: 'top',
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
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  issueButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  issueButtonText: {
    color: '#000',
  },
  issueButtonTextSelected: {
    color: '#fff',
  },
});
